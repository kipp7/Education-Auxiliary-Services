param(
  [int]$IntervalSeconds = 120,
  [switch]$ForceFetch,
  [switch]$AutoMergeQueueUpdates,
  [switch]$DryRun,
  [string]$Remote = "origin",
  [string]$MainBranch = "main",
  [string]$QueueFile = "modules/99-hub/REQUESTS.md",
  [string]$LogFile = "modules/99-hub/merge_queue_daemon.log",
  [string]$QueueUpdateBranchPattern = "feat/99-hub-request-*"
)

$ErrorActionPreference = "Stop"

function Write-Log([string]$Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$ts] $Message"
  Write-Host $line
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

function Has-PendingQueueItems {
  # Prefer reading queue from remote main (if fetch enabled) so the daemon can
  # see newly-enqueued items even when the local working tree isn't updated.
  $lines = @()

  if ($ForceFetch -and (-not $DryRun)) {
    try {
      git fetch --all --prune | Out-Null
    } catch {
      # Ignore fetch errors; fall back to local file.
    }
  }

  try {
    $remoteQueue = git show "$Remote/$MainBranch`:$QueueFile" 2>$null
    if ($LASTEXITCODE -eq 0 -and $remoteQueue) {
      $lines = @($remoteQueue -split "`r?`n")
    }
  } catch {
    # ignore and fall back
  }

  if ($lines.Count -eq 0) {
    if (-not (Test-Path $QueueFile)) { return $false }
    $lines = Get-Content -Path $QueueFile -Encoding UTF8
  }

  foreach ($l in $lines) {
    # Accept either:
    # - - [ ] `feat/...`
    # - - [ ] feat/...
    if ($l -match '^\-\s+\[\s\]\s+`(feat\/[^`]+)`') { return $true }
    if ($l -match '^\-\s+\[\s\]\s+(feat\/\S+)') { return $true }
  }
  return $false
}

function Sync-QueueUpdatesToMain {
  if (-not $AutoMergeQueueUpdates) { return }

  # If the daemon can't safely switch branches, skip.
  $dirty = git status --porcelain=v1
  if ($dirty) {
    Write-Log "AutoMergeQueueUpdates: working tree not clean; skipping queue update sync."
    return
  }

  if ($ForceFetch -and (-not $DryRun)) {
    Write-Log "AutoMergeQueueUpdates: fetching all remotes..."
    git fetch --all --prune | Out-Null
  }

  # Ensure main is up-to-date before merging queue update branches.
  if (-not $DryRun) {
    Write-Log "AutoMergeQueueUpdates: checking out $MainBranch..."
    git checkout $MainBranch | Out-Null
    Write-Log "AutoMergeQueueUpdates: rebasing on $Remote/$MainBranch..."
    git pull --rebase $Remote $MainBranch | Out-Null
  } else {
    Write-Log "AutoMergeQueueUpdates: DryRun would checkout/pull $MainBranch"
  }

  $refs = @(
    git for-each-ref --format="%(refname:short)" "refs/remotes/$Remote/$QueueUpdateBranchPattern" 2>$null
    | Where-Object { $_ -and $_.Trim() -ne "" }
  )

  if ($refs.Count -eq 0) {
    Write-Log "AutoMergeQueueUpdates: no remote branches match $Remote/$QueueUpdateBranchPattern"
    return
  }

  foreach ($ref in $refs) {
    $branch = $ref
    if ($branch.StartsWith("$Remote/")) {
      $branch = $branch.Substring($Remote.Length + 1)
    }

    # Skip already-merged branches.
    git merge-base --is-ancestor "$Remote/$branch" $MainBranch | Out-Null
    if ($LASTEXITCODE -eq 0) { continue }

    # Only auto-merge branches that touch QueueFile and nothing else.
    $changed = @(
      git diff --name-only "$MainBranch..$Remote/$branch" 2>$null
      | Where-Object { $_ -and $_.Trim() -ne "" }
    )
    if ($changed.Count -eq 0) { continue }
    $outOfScope = @($changed | Where-Object { $_ -ne $QueueFile })
    if ($outOfScope.Count -gt 0) {
      Write-Log "AutoMergeQueueUpdates: skip $branch (touches other files: $($outOfScope -join ', '))"
      continue
    }

    if ($DryRun) {
      Write-Log "AutoMergeQueueUpdates: DryRun would merge $Remote/$branch into $MainBranch"
      continue
    }

    Write-Log "AutoMergeQueueUpdates: merging $Remote/$branch into $MainBranch..."
    git merge --no-ff "$Remote/$branch" -m "hub: merge queue update $branch" | Out-Null
    Write-Log "AutoMergeQueueUpdates: pushing $MainBranch..."
    git push $Remote $MainBranch | Out-Null
  }
}

Write-Log "=== merge_queue_daemon start (IntervalSeconds=$IntervalSeconds, DryRun=$DryRun, ForceFetch=$ForceFetch) ==="

while ($true) {
  try {
    Sync-QueueUpdatesToMain

    if (Has-PendingQueueItems) {
      Write-Log "Pending items detected. Running merge_queue.ps1..."
      $args = @()
      if ($DryRun) { $args += "-DryRun" }
      if ($ForceFetch) { $args += "-ForceFetch" }
      $args += "-Remote"; $args += $Remote
      $args += "-MainBranch"; $args += $MainBranch
      $args += "-QueueFile"; $args += $QueueFile

      pwsh -NoProfile -ExecutionPolicy Bypass -File modules/99-hub/merge_queue.ps1 @args
      Write-Log "merge_queue.ps1 finished."
    } else {
      Write-Log "No pending items. Sleeping..."
    }
  } catch {
    Write-Log ("ERROR: " + $_.Exception.Message)
    Write-Log "Sleeping after error (no auto-retry merge until next interval)."
  }

  Start-Sleep -Seconds $IntervalSeconds
}
