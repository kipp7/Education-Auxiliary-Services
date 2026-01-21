param(
  [int]$IntervalSeconds = 120,
  [switch]$ForceFetch,
  [switch]$DryRun,
  [string]$Remote = "origin",
  [string]$MainBranch = "main",
  [string]$QueueFile = "modules/99-hub/REQUESTS.md",
  [string]$LogFile = "modules/99-hub/merge_queue_daemon.log"
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

Write-Log "=== merge_queue_daemon start (IntervalSeconds=$IntervalSeconds, DryRun=$DryRun, ForceFetch=$ForceFetch) ==="

while ($true) {
  try {
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
