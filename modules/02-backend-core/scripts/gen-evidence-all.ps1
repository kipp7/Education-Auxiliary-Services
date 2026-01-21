$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$logPath = Join-Path $logDir "evidence-all.txt"

function Append([string]$text) {
  $text | Out-File -Append -Encoding utf8 $logPath
}

"# evidence-all" | Out-File -Encoding utf8 $logPath
Append ("GeneratedAt=" + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))

$scripts = Get-ChildItem -Path $PSScriptRoot -Filter "gen-evidence*.ps1" | Where-Object {
  $_.Name -ne "gen-evidence-all.ps1"
} | Sort-Object Name

if (-not $scripts -or $scripts.Count -eq 0) {
  Append "No evidence scripts found."
  exit 0
}

Append ("Scripts=" + ($scripts.Name -join ", "))

foreach ($s in $scripts) {
  Append ""
  Append ("## " + $s.Name)
  $start = Get-Date
  try {
    & powershell -NoProfile -ExecutionPolicy Bypass -File $s.FullName 2>&1 | ForEach-Object { Append $_ }
    Append ("exit=0 durationSeconds=" + [int]((Get-Date) - $start).TotalSeconds)
  } catch {
    Append ("ERROR: " + $_.Exception.Message)
    Append ("exit=1 durationSeconds=" + [int]((Get-Date) - $start).TotalSeconds)
  }
}

Append ""
Append "OK"

