param(
  [Parameter(Mandatory = $true)]
  [string]$Module,
  [int]$IntervalSeconds = 10,
  [string]$OutboxDir = (Join-Path $PSScriptRoot "outbox"),
  [switch]$RunOnce
)

$ErrorActionPreference = "Stop"

$utf8 = [System.Text.UTF8Encoding]::new()
$OutputEncoding = $utf8
[Console]::OutputEncoding = $utf8
[Console]::InputEncoding = $utf8

function Read-All([string]$Path) {
  if (-not (Test-Path $Path)) { return "" }
  return (Get-Content -Path $Path -Encoding UTF8 -Raw)
}

$path = Join-Path $OutboxDir "$Module.txt"
$lastHash = ""

Write-Host "Listening: $path (IntervalSeconds=$IntervalSeconds)"

while ($true) {
  try {
    $text = Read-All $path
    if ($text) {
      $hash = (Get-FileHash -Path $path -Algorithm SHA256).Hash
      if ($hash -ne $lastHash) {
        $lastHash = $hash
        $tail = $text -split "`r?`n" | Select-Object -Last 20
        Write-Host "----- NEW MESSAGE ($Module) -----"
        $tail | ForEach-Object { Write-Host $_ }
        Write-Host "-------------------------------"
      }
    }
  } catch {
    Write-Host ("ERROR: " + $_.Exception.Message)
  }

  if ($RunOnce) { break }
  Start-Sleep -Seconds $IntervalSeconds
}

