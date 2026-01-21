param(
  [int]$IntervalSeconds = 120,
  [switch]$ForceFetch,
  [switch]$AutoMergeQueueUpdates,
  [switch]$AutoEnqueueFromModuleLogs,
  [switch]$RunOnce,
  [switch]$DryRun,
  [string]$Remote = "origin",
  [string]$MainBranch = "main",
  [string]$QueueFile = "modules/99-hub/REQUESTS.md",
  [string]$LogFile = "modules/99-hub/merge_queue_daemon.log",
  [string]$QueueUpdateBranchPattern = "feat/99-hub-request-*",
  [string]$AutoEnqueueRequestBranchPrefix = "feat/99-hub-request-autoenqueue",
  [string[]]$AutoEnqueueModuleDirs = @("01-miniapp", "02-backend-core", "03-importer", "04-admin-console")
)

$ErrorActionPreference = "Stop"

$utf8 = [System.Text.UTF8Encoding]::new()
$OutputEncoding = $utf8
[Console]::OutputEncoding = $utf8
[Console]::InputEncoding = $utf8

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
      $text = @($remoteQueue) -join "`n"
      $lines = @($text -split "`r?`n")
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

function Get-QueuedFeatBranches {
  $lines = @()
  try {
    $remoteQueue = git show "$Remote/$MainBranch`:$QueueFile" 2>$null
    if ($LASTEXITCODE -eq 0 -and $remoteQueue) {
      $text = @($remoteQueue) -join "`n"
      $lines = @($text -split "`r?`n")
    }
  } catch {
    # ignore and fall back
  }

  if ($lines.Count -eq 0) {
    if (-not (Test-Path $QueueFile)) { return @() }
    $lines = Get-Content -Path $QueueFile -Encoding UTF8
  }

  $branches = New-Object System.Collections.Generic.HashSet[string]
  foreach ($l in $lines) {
    # Accept either:
    # - - [ ] `feat/...`
    # - - [x] feat/...
    # - - [!] feat/... (blocked)
    if ($l -match '^\-\s+\[[ x!]\]\s+`(feat\/[^`]+)`') { $branches.Add($Matches[1]) | Out-Null; continue }
    if ($l -match '^\-\s+\[[ x!]\]\s+(feat\/\S+)') { $branches.Add($Matches[1]) | Out-Null; continue }
  }
  return @($branches)
}

function Get-RemoteFeatBranches {
  return @(
    git for-each-ref --format="%(refname:short)" "refs/remotes/$Remote/feat/*" 2>$null
    | Where-Object { $_ -and $_.Trim() -ne "" }
  )
}

function Try-ExtractMrInfoFromModuleLog {
  param(
    [object]$LogText,
    [string]$BranchName,
    [string]$ModuleDir
  )

  $result = @{
    Branch = $BranchName
    Acceptance = "验收：见 `modules/$ModuleDir/CONVERSATION_LOG.txt` 最新一段"
    HasMrBlock = $false
  }

  if (-not $LogText) { return $result }

  $text = @($LogText) -join "`n"
  $lines = @($text -split "`r?`n")

  $wantedBranch = ($BranchName | ForEach-Object { $_.Trim() })

  # Only enqueue when THIS branch has an MR block near the end of the log.
  # This prevents accidentally enqueueing historical branches just because their names appear somewhere in the log.
  if ($wantedBranch) {
    $tailMax = 140
    $start = [Math]::Max(0, $lines.Count - $tailMax)
    $end = $lines.Count - 1

    $branchIdx = -1
    for ($i = $end; $i -ge $start; $i--) {
      $t = $lines[$i].Trim()
      if (-not $t) { continue }

      if (($t -match '^\s*(?:branch|\u5206\u652F)\s*(?:[:：]|ï¼š)') -and ($t -match [regex]::Escape($wantedBranch))) {
        $branchIdx = $i
        break
      }
    }

    if ($branchIdx -ge 0) {
      $acceptEnd = [Math]::Min($end, $branchIdx + 30)
      for ($j = $branchIdx; $j -le $acceptEnd; $j++) {
        $t = $lines[$j].Trim()
        if ($t -match '^\s*(?:acceptance|\u9A8C\u6536\u65B9\u5F0F|\u9A8C\u6536|éªŒæ”¶)\s*(?:[:：]|ï¼š)') {
          $result.Branch = $wantedBranch
          $result.HasMrBlock = $true
          break
        }
      }
    }
  }

  return $result
}

function AutoEnqueue-FromModuleLogs {
  if (-not $AutoEnqueueFromModuleLogs) { return }

  # Keep safety: only run when working tree is clean.
  $dirty = git status --porcelain=v1
  if ($dirty) {
    Write-Log "AutoEnqueueFromModuleLogs: working tree not clean; skipping auto enqueue."
    return
  }

  if ($ForceFetch -and (-not $DryRun)) {
    Write-Log "AutoEnqueueFromModuleLogs: fetching all remotes..."
    git fetch --all --prune | Out-Null
  }

  $queued = Get-QueuedFeatBranches
  $queuedSet = New-Object System.Collections.Generic.HashSet[string]
  foreach ($q in $queued) { $queuedSet.Add($q) | Out-Null }

  $remoteRefs = Get-RemoteFeatBranches
  if ($remoteRefs.Count -eq 0) { return }

  $candidates = @()
  foreach ($moduleDir in $AutoEnqueueModuleDirs) {
    $prefix = "$Remote/feat/$moduleDir-"
    $logPath = "modules/$moduleDir/CONVERSATION_LOG.txt"
    $matched = 0
    $missingLogs = 0
    $mrBlocks = 0
    $newItems = 0

    foreach ($ref in $remoteRefs) {
      if (-not $ref.StartsWith($prefix)) { continue }
      $matched++

      $branch = $ref.Substring($Remote.Length + 1) # strip "origin/"

      # Skip request branches and 99-hub control branches.
      if ($branch -like $QueueUpdateBranchPattern) { continue }
      if ($branch -like "feat/99-hub-*") { continue }

      # If the branch is already merged into main, skip enqueue.
      git merge-base --is-ancestor "$Remote/$branch" $MainBranch | Out-Null
      if ($LASTEXITCODE -eq 0) { continue }

      # Read module log from the branch (required for A workflow).
      $logText = ""
      try {
        $logText = git show "$Remote/$branch`:$logPath" 2>$null
      } catch {
        $logText = ""
      }
      if (-not $logText) { $missingLogs++; continue }

      $mr = Try-ExtractMrInfoFromModuleLog -LogText $logText -BranchName $branch -ModuleDir $moduleDir
      if (-not $mr.HasMrBlock) { continue }
      $mrBlocks++
      $featBranch = $mr.Branch
      if (-not $featBranch.StartsWith("feat/")) { continue }
      if ($queuedSet.Contains($featBranch)) { continue }

      $candidates += [pscustomobject]@{
        ModuleDir = $moduleDir
        FeatBranch = $featBranch
        Acceptance = $mr.Acceptance
        LogPath = $logPath
      }
      $newItems++
    }

    if ($matched -gt 0) {
      Write-Log "AutoEnqueueFromModuleLogs: module=$moduleDir matched=$matched missingLogs=$missingLogs mrBlocks=$mrBlocks new=$newItems"
    }
  }

  Write-Log "AutoEnqueueFromModuleLogs: scannedRefs=$($remoteRefs.Count) candidates=$($candidates.Count)"
  if ($candidates.Count -eq 0) { return $false }

  # Build a request branch that ONLY touches QueueFile.
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $requestBranch = "$AutoEnqueueRequestBranchPrefix-$ts"

  if ($DryRun) {
    Write-Log "AutoEnqueueFromModuleLogs: DryRun would create $requestBranch with $($candidates.Count) items."
    foreach ($c in $candidates) {
      Write-Log "AutoEnqueueFromModuleLogs: would enqueue $($c.FeatBranch) (验收见 $($c.LogPath))"
    }
    return $false
  }

  Write-Log "AutoEnqueueFromModuleLogs: checking out $MainBranch..."
  git checkout $MainBranch | Out-Null
  Write-Log "AutoEnqueueFromModuleLogs: rebasing on $Remote/$MainBranch..."
  git pull --rebase $Remote $MainBranch | Out-Null

  Write-Log "AutoEnqueueFromModuleLogs: creating request branch $requestBranch..."
  git checkout -b $requestBranch | Out-Null

  if (-not (Test-Path $QueueFile)) {
    throw "QueueFile not found: $QueueFile"
  }

  $queueLines = Get-Content -Path $QueueFile -Encoding UTF8
  $insertAt = -1
  for ($i = 0; $i -lt $queueLines.Count; $i++) {
    if ($queueLines[$i] -match '^##\s+合并队列') {
      # Insert right before the first existing queue item to keep newest on top.
      for ($j = $i; $j -lt $queueLines.Count; $j++) {
        if ($queueLines[$j] -match '^\-\s+\[[ x]\]\s+') { $insertAt = $j; break }
      }
      break
    }
  }
  if ($insertAt -lt 0) { $insertAt = $queueLines.Count }

  $newLines = @()
  foreach ($c in $candidates | Sort-Object FeatBranch -Unique) {
    $newLines += "- [ ] $($c.FeatBranch) → $($c.ModuleDir)：$($c.Acceptance)"
  }

  $updated = @()
  if ($insertAt -gt 0) { $updated += $queueLines[0..($insertAt-1)] }
  $updated += $newLines
  if ($insertAt -lt $queueLines.Count) { $updated += $queueLines[$insertAt..($queueLines.Count-1)] }

  Set-Content -Path $QueueFile -Value $updated -Encoding UTF8

  git add $QueueFile | Out-Null
  git commit -m "hub:auto-enqueue from module logs ($($newLines.Count))" | Out-Null
  git push $Remote $requestBranch | Out-Null

  Write-Log "AutoEnqueueFromModuleLogs: pushed $requestBranch (enqueued $($newLines.Count) items)."

  # Return to main for subsequent steps.
  git checkout $MainBranch | Out-Null
  return $true
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
    $enqueued = AutoEnqueue-FromModuleLogs
    if ($enqueued) {
      # Merge the just-created request branch in the same tick to minimize manual waiting.
      Sync-QueueUpdatesToMain
    }

    if (Has-PendingQueueItems) {
      $dirty = git status --porcelain=v1
      if ($dirty) {
        Write-Log "Working tree is not clean; skipping merge_queue.ps1 run to avoid conflicts."
        continue
      }

      Write-Log "Pending items detected. Running merge_queue.ps1..."
      $args = @()
      if ($DryRun) { $args += "-DryRun" }
      if ($ForceFetch) { $args += "-ForceFetch" }
      $args += "-Remote"; $args += $Remote
      $args += "-MainBranch"; $args += $MainBranch
      $args += "-QueueFile"; $args += $QueueFile

      pwsh -NoProfile -ExecutionPolicy Bypass -File modules/99-hub/merge_queue.ps1 @args
      if ($LASTEXITCODE -ne 0) {
        Write-Log "merge_queue.ps1 exited with code $LASTEXITCODE."
      }
      Write-Log "merge_queue.ps1 finished."
    } else {
      Write-Log "No pending items. Sleeping..."
    }
  } catch {
    Write-Log ("ERROR: " + $_.Exception.Message)
    Write-Log "Sleeping after error (no auto-retry merge until next interval)."
  }

  if ($RunOnce) { break }
  Start-Sleep -Seconds $IntervalSeconds
}
