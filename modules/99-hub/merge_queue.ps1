param(
  [switch]$DryRun,
  [switch]$ForceFetch,
  [string]$Remote = "origin",
  [string]$MainBranch = "main",
  [string]$QueueFile = "modules/99-hub/REQUESTS.md",
  [string]$LogFile = "modules/99-hub/merge_queue.log"
)

$ErrorActionPreference = "Stop"

function Write-Log([string]$Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$ts] $Message"
  Write-Host $line
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

function Require-CleanWorktree {
  $status = git status --porcelain=v1
  if ($status) {
    throw "Working tree is not clean. Commit/stash changes before merging."
  }
}

function Ensure-Branch([string]$Branch) {
  $refs = git show-ref --verify --quiet "refs/remotes/$Remote/$Branch"
  if ($LASTEXITCODE -ne 0) {
    throw "Remote branch not found: $Remote/$Branch"
  }
}

function Is-AlreadyMerged([string]$Branch) {
  git merge-base --is-ancestor "$Remote/$Branch" $MainBranch | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function Normalize-Branch([string]$Raw) {
  $b = $Raw.Trim()
  if ($b.StartsWith("$Remote/")) {
    return $b.Substring($Remote.Length + 1)
  }
  if ($b.StartsWith("refs/heads/")) {
    return $b.Substring("refs/heads/".Length)
  }
  if ($b.StartsWith("refs/remotes/$Remote/")) {
    return $b.Substring(("refs/remotes/$Remote/").Length)
  }
  return $b
}

function Parse-Queue([string[]]$Lines) {
  $items = @()
  for ($i = 0; $i -lt $Lines.Count; $i++) {
    $line = $Lines[$i]
    # Accept either:
    # - - [ ] `feat/...`
    # - - [ ] feat/...
    if ($line -match '^\-\s+\[\s\]\s+`(feat\/[^`]+)`') {
      $branch = $Matches[1]
      $items += [pscustomobject]@{
        Index = $i
        RawLine = $line
        Branch = (Normalize-Branch $branch)
      }
      continue
    }
    if ($line -match '^\-\s+\[\s\]\s+(feat\/\S+)') {
      $branch = $Matches[1]
      $items += [pscustomobject]@{
        Index = $i
        RawLine = $line
        Branch = (Normalize-Branch $branch)
      }
    }
  }
  return $items
}

function Mark-Merged([string]$Line) {
  return ($Line -replace '^\-\s+\[\s\]\s+', '- [x] ')
}

Write-Log "=== merge_queue start (DryRun=$DryRun, Remote=$Remote, MainBranch=$MainBranch) ==="

if (-not (Test-Path $QueueFile)) {
  throw "Queue file not found: $QueueFile"
}

Require-CleanWorktree

if ($ForceFetch) {
  if (-not $DryRun) {
    Write-Log "Fetching all remotes..."
    git fetch --all --prune | Out-Null
  } else {
    Write-Log "DryRun: would fetch --all --prune"
  }
}

if (-not $DryRun) {
  Write-Log "Checking out $MainBranch..."
  git checkout $MainBranch | Out-Null
  Write-Log "Rebasing on $Remote/$MainBranch..."
  git pull --rebase $Remote $MainBranch | Out-Null
} else {
  Write-Log "DryRun: would checkout $MainBranch and pull --rebase $Remote $MainBranch"
}

$lines = Get-Content -Path $QueueFile -Encoding UTF8
$queue = Parse-Queue $lines

if ($queue.Count -eq 0) {
  Write-Log "No pending items in merge queue."
  Write-Log "=== merge_queue done ==="
  exit 0
}

Write-Log "Pending merges: $($queue.Count)"

foreach ($item in $queue) {
  $branch = $item.Branch
  Write-Log "Processing: $branch"

  if (-not $DryRun) {
    Ensure-Branch $branch
    if (Is-AlreadyMerged $branch) {
      Write-Log "Already merged: $Remote/$branch is ancestor of $MainBranch. Skipping merge."
    } else {
      Write-Log "Merging $Remote/$branch into $MainBranch..."
      git merge --no-ff "$Remote/$branch" -m "Merge $branch" | Out-Null
    }
  } else {
    Write-Log "DryRun: would merge $Remote/$branch into $MainBranch"
  }

  # Mark queue item as merged
  $lines[$item.Index] = Mark-Merged $lines[$item.Index]

  if (-not $DryRun) {
    Write-Log "Pushing $MainBranch..."
    git push $Remote $MainBranch | Out-Null
    Write-Log "Updating queue file..."
    $lines | Set-Content -Path $QueueFile -Encoding UTF8
    git add $QueueFile | Out-Null
    git commit -m "hub: mark $branch merged" | Out-Null
    git push $Remote $MainBranch | Out-Null
  } else {
    Write-Log "DryRun: would push and update $QueueFile"
  }
}

Write-Log "=== merge_queue done ==="
