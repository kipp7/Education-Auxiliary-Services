param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$ZipPath,

  [Parameter(Mandatory = $false)]
  [string]$OutDir = "",

  [Parameter(Mandatory = $false)]
  [string]$FileListOut = ""
)

$ErrorActionPreference = "Stop"

function Resolve-Absolute([string]$p) {
  if ([string]::IsNullOrWhiteSpace($p)) { return "" }
  return (Resolve-Path -LiteralPath $p).Path
}

function Ensure-Dir([string]$p) {
  if (!(Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Path $p | Out-Null
  }
}

if (!(Test-Path -LiteralPath $ZipPath)) {
  throw "Zip not found: $ZipPath"
}

$zipAbs = (Resolve-Path -LiteralPath $ZipPath).Path
$zipName = [IO.Path]::GetFileNameWithoutExtension($zipAbs)

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path (Get-Location) ("modules/03-importer/output/unpacked/" + $zipName)
}

if ([string]::IsNullOrWhiteSpace($FileListOut)) {
  $FileListOut = Join-Path (Get-Location) ("modules/03-importer/output/" + $zipName + ".file-list.txt")
}

$outAbs = [IO.Path]::GetFullPath($OutDir)
$fileListAbs = [IO.Path]::GetFullPath($FileListOut)

Ensure-Dir $outAbs
Ensure-Dir ([IO.Path]::GetDirectoryName($fileListAbs))

Expand-Archive -LiteralPath $zipAbs -DestinationPath $outAbs -Force

$files = Get-ChildItem -LiteralPath $outAbs -Recurse -File | ForEach-Object {
  $full = $_.FullName
  $rel = $full.Substring($outAbs.Length).TrimStart("\", "/")
  $rel.Replace("\", "/")
}

$content = ($files | Sort-Object) -join "`n"
[IO.File]::WriteAllText($fileListAbs, $content, [Text.UTF8Encoding]::new($false))

Write-Output ("extractedTo=" + $outAbs.Replace("\", "/"))
Write-Output ("fileList=" + $fileListAbs.Replace("\", "/"))
