param(
  [Parameter()]
  [string]$ModulePath = "modules/99-hub",

  [Parameter()]
  [switch]$StagedOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Normalize-RepoPath {
  param([Parameter(Mandatory)][string]$Path)
  return ($Path -replace "\\", "/").Trim()
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\.."))
if (-not (Test-Path (Join-Path $repoRoot ".git"))) {
  throw "Expected git repo root at '$repoRoot' but .git was not found."
}

Push-Location $repoRoot
try {
  $modulePrefix = (Normalize-RepoPath -Path $ModulePath).TrimEnd("/") + "/"

  [string[]]$pathsToCheck = @()

  if ($StagedOnly) {
    $pathsToCheck = @(git diff --cached --name-only)
  }
  else {
    $raw = (git status --porcelain=v1 -z)
    if ($LASTEXITCODE -ne 0) {
      throw "git status failed."
    }

    $items = @($raw -split [char]0 | Where-Object { $_ -ne "" })

    for ($i = 0; $i -lt $items.Count; $i++) {
      $entry = $items[$i]
      if ($entry.Length -lt 4) { continue }

      $xy = $entry.Substring(0, 2)
      $src = $entry.Substring(3)
      $pathsToCheck += $src

      $isRenameOrCopy =
        ($xy[0] -eq 'R') -or ($xy[0] -eq 'C') -or
        ($xy[1] -eq 'R') -or ($xy[1] -eq 'C')

      if ($isRenameOrCopy -and ($i + 1 -lt $items.Count)) {
        $dst = $items[$i + 1]
        $pathsToCheck += $dst
        $i++
      }
    }
  }

  $pathsToCheck = @($pathsToCheck | Where-Object { $_ -and $_.Trim() -ne "" } | ForEach-Object { Normalize-RepoPath -Path $_ } | Sort-Object -Unique)

  $outOfScope = @($pathsToCheck | Where-Object { -not $_.StartsWith($modulePrefix) })

  if ($outOfScope.Count -gt 0) {
    Write-Host "Out-of-scope changes detected (expected under '$ModulePath'):" -ForegroundColor Red
    $outOfScope | ForEach-Object { Write-Host " - $_" }
    exit 2
  }

  Write-Host "OK: all changes are under '$ModulePath'." -ForegroundColor Green
  exit 0
}
finally {
  Pop-Location
}
