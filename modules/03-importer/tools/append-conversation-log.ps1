param(
  [Parameter(Mandatory = $true)]
  [string]$Branch,

  [Parameter(Mandatory = $false)]
  [string[]]$Acceptance = @(),

  [Parameter(Mandatory = $false)]
  [string]$AcceptanceFile = "",

  [Parameter(Mandatory = $false)]
  [string[]]$Changes = @(),

  [Parameter(Mandatory = $false)]
  [string]$ChangesFile = "",

  [Parameter(Mandatory = $false)]
  [string]$Date = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Read-LinesFromFile([string]$p) {
  if ([string]::IsNullOrWhiteSpace($p)) { return @() }
  if (!(Test-Path -LiteralPath $p)) { throw "File not found: $p" }
  return (Get-Content -LiteralPath $p -Encoding UTF8) | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
}

if ([string]::IsNullOrWhiteSpace($Date)) {
  $Date = (Get-Date).ToString("yyyy-MM-dd")
}

$branchValue = $Branch.Trim()
if (-not $branchValue.StartsWith("feat/")) {
  throw "Branch must start with 'feat/': $Branch"
}

if (-not [string]::IsNullOrWhiteSpace($AcceptanceFile) -and $Acceptance.Count -gt 0) {
  throw "Provide either -Acceptance or -AcceptanceFile, not both."
}
if (-not [string]::IsNullOrWhiteSpace($ChangesFile) -and $Changes.Count -gt 0) {
  throw "Provide either -Changes or -ChangesFile, not both."
}

$acceptList = @()
$acceptList += $Acceptance | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
$acceptList += Read-LinesFromFile $AcceptanceFile

$changeList = @()
$changeList += $Changes | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
$changeList += Read-LinesFromFile $ChangesFile

if ($acceptList.Count -lt 1) { throw "Acceptance must have at least 1 item." }
if ($changeList.Count -lt 1) { throw "Changes must have at least 1 item." }

$logPath = Join-Path (Get-Location) "modules/03-importer/CONVERSATION_LOG.txt"
if (!(Test-Path -LiteralPath $logPath)) {
  throw "Missing CONVERSATION_LOG.txt: $logPath"
}

$acceptLines = ($acceptList | ForEach-Object { "- " + $_ }) -join "`n"
$changeLines = ($changeList | ForEach-Object { "- " + $_ }) -join "`n"

$block = @"

--- $Date ---
分支：$branchValue
验收：
$acceptLines
变更点：
$changeLines
"@

Add-Content -LiteralPath $logPath -Value $block -Encoding UTF8
Write-Output ("appendedTo=" + $logPath.Replace("\", "/"))
