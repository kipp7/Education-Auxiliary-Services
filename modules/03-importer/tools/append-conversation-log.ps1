param(
  [Parameter(Mandatory = $true)]
  [string]$Branch,

  [Parameter(Mandatory = $true)]
  [string[]]$Acceptance,

  [Parameter(Mandatory = $true)]
  [string[]]$Changes,

  [Parameter(Mandatory = $false)]
  [string]$Date = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Date)) {
  $Date = (Get-Date).ToString("yyyy-MM-dd")
}

$branchValue = $Branch.Trim()
if (-not $branchValue.StartsWith("feat/")) {
  throw "Branch must start with 'feat/': $Branch"
}

if ($Acceptance.Count -lt 1) { throw "Acceptance must have at least 1 item" }
if ($Changes.Count -lt 1) { throw "Changes must have at least 1 item" }

$logPath = Join-Path (Get-Location) "modules/03-importer/CONVERSATION_LOG.txt"
if (!(Test-Path -LiteralPath $logPath)) {
  throw "Missing CONVERSATION_LOG.txt: $logPath"
}

$acceptLines = ($Acceptance | ForEach-Object { "- " + $_.Trim() }) -join "`n"
$changeLines = ($Changes | ForEach-Object { "- " + $_.Trim() }) -join "`n"

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
