param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$ZipPath,

  [Parameter(Mandatory = $false)]
  [string]$OutDir = "",

  [Parameter(Mandatory = $false)]
  [string]$FileListOut = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$p) {
  if (!(Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Force -Path $p | Out-Null
  }
}

function Write-Utf8NoBom([string]$path, [string]$content) {
  $abs = [IO.Path]::GetFullPath($path)
  $dir = [IO.Path]::GetDirectoryName($abs)
  if ($dir) { Ensure-Dir $dir }
  [IO.File]::WriteAllText($abs, $content, [Text.UTF8Encoding]::new($false))
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
Ensure-Dir $outAbs

Expand-Archive -LiteralPath $zipAbs -DestinationPath $outAbs -Force

$files = Get-ChildItem -LiteralPath $outAbs -Recurse -File | ForEach-Object {
  $full = $_.FullName
  $rel = $full.Substring($outAbs.Length).TrimStart("\", "/")
  $rel.Replace("\", "/")
}

$content = ($files | Sort-Object) -join "`n"
Write-Utf8NoBom $FileListOut $content

Write-Output ("extractedTo=" + $outAbs.Replace("\", "/"))
Write-Output ("fileList=" + ([IO.Path]::GetFullPath($FileListOut).Replace("\", "/")))
