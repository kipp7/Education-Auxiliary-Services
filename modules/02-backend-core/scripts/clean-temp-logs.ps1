$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "logs"

if (-not (Test-Path $logDir)) {
  Write-Host "logs directory not found: $logDir"
  exit 0
}

$patterns = @("*-server.out.txt", "*-server.err.txt")
$files = foreach ($p in $patterns) { Get-ChildItem -Path $logDir -Filter $p -File -ErrorAction SilentlyContinue }

if (-not $files -or $files.Count -eq 0) {
  Write-Host "No temp server log files found."
  exit 0
}

Write-Host ("Deleting " + $files.Count + " temp server log file(s) under " + $logDir)
$files | ForEach-Object { Remove-Item -Force -LiteralPath $_.FullName }

Write-Host "OK"

