param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$ZipPath,

  [Parameter(Mandatory = $false)]
  [string]$OutDir = "",

  [Parameter(Mandatory = $false)]
  [string]$CategoryPrefix = ""
)

$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$p) {
  if (!(Test-Path -LiteralPath $p)) {
    New-Item -ItemType Directory -Path $p | Out-Null
  }
}

function Utf8NoBomWriteAllText([string]$path, [string]$content) {
  [IO.File]::WriteAllText($path, $content, [Text.UTF8Encoding]::new($false))
}

function ReadJsonFile([string]$path) {
  $raw = Get-Content -LiteralPath $path -Raw -Encoding UTF8
  return $raw | ConvertFrom-Json -Depth 50
}

function Join-Category([string]$prefix, [string]$categoryPath) {
  $p = ($prefix ?? "").Trim().Trim("/")
  $c = ($categoryPath ?? "").Trim().Trim("/")
  if ([string]::IsNullOrWhiteSpace($p)) { return $c }
  if ([string]::IsNullOrWhiteSpace($c)) { return $p }
  return "$p/$c"
}

function Is-JunkRelPath([string]$p) {
  if ([string]::IsNullOrWhiteSpace($p)) { return $true }
  $lower = $p.ToLowerInvariant()
  if ($lower -eq ".ds_store" -or $lower.EndsWith("/.ds_store")) { return $true }
  if ($lower -eq "thumbs.db" -or $lower.EndsWith("/thumbs.db")) { return $true }
  if ($lower.StartsWith("__macosx/")) { return $true }
  return $false
}

function Normalize-RelPath([string]$p) {
  return ($p.Trim() -replace '\\', '/' -replace '^/+', '' -replace '/+', '/')
}

function Collapse-SingleRoot([string[]]$paths) {
  # If all paths share the same first segment and there is no file at root, collapse it.
  if ($paths.Count -eq 0) { return @{ collapsed = $paths; root = "" } }
  $segs = $paths | ForEach-Object { $_.Split('/') | Where-Object { $_ -ne "" } }
  $first = $segs[0][0]
  if ([string]::IsNullOrWhiteSpace($first)) { return @{ collapsed = $paths; root = "" } }
  $allSame = $true
  foreach ($s in $segs) { if ($s.Count -eq 0 -or $s[0] -ne $first) { $allSame = $false; break } }
  if (-not $allSame) { return @{ collapsed = $paths; root = "" } }
  $hasRootFile = $false
  foreach ($s in $segs) { if ($s.Count -eq 1) { $hasRootFile = $true; break } }
  if ($hasRootFile) { return @{ collapsed = $paths; root = "" } }
  $collapsed = @()
  foreach ($p in $paths) {
    $parts = $p.Split('/') | Where-Object { $_ -ne "" }
    $collapsed += (($parts | Select-Object -Skip 1) -join '/')
  }
  return @{ collapsed = $collapsed; root = $first }
}

if (!(Test-Path -LiteralPath $ZipPath)) {
  throw "Zip not found: $ZipPath"
}

$zipAbs = (Resolve-Path -LiteralPath $ZipPath).Path
$zipName = [IO.Path]::GetFileNameWithoutExtension($zipAbs)

$repoRoot = (Get-Location).Path
$txtScript = Join-Path $repoRoot "modules/03-importer/tools/parse-txt.mjs"

if (!(Test-Path -LiteralPath $txtScript)) { throw "Missing: $txtScript" }

if ([string]::IsNullOrWhiteSpace($OutDir)) {
  $OutDir = Join-Path $repoRoot ("modules/03-importer/output/import-local/" + $zipName)
}
$outAbs = [IO.Path]::GetFullPath($OutDir)
Ensure-Dir $outAbs

$extractDir = Join-Path $outAbs "unpacked"
$fileList = Join-Path $outAbs "file-list.txt"
$mappingOut = Join-Path $outAbs "mapping.json"
$questionsOut = Join-Path $outAbs "questions.json"
$taskOut = Join-Path $outAbs "import-task.json"

# 1) unzip
Ensure-Dir $extractDir
Expand-Archive -LiteralPath $zipAbs -DestinationPath $extractDir -Force

# 2) compute normalized file list and collapsed logical paths
$physicalRel = Get-ChildItem -LiteralPath $extractDir -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($extractDir.Length).TrimStart("\", "/")
  Normalize-RelPath $rel
} | Where-Object { -not (Is-JunkRelPath $_) } | Sort-Object

$collapse = Collapse-SingleRoot $physicalRel
$logicalRel = $collapse.collapsed

Utf8NoBomWriteAllText $fileList (($logicalRel | Where-Object { $_ -and $_.Trim() -ne "" }) -join "`n")

$mapping = @()
for ($i = 0; $i -lt $physicalRel.Count; $i++) {
  $phys = $physicalRel[$i]
  $logi = $logicalRel[$i]
  $dir = ""
  if ($logi -match "/") { $dir = ($logi -replace "/[^/]+$", "") }
  $cat = if ([string]::IsNullOrWhiteSpace($dir)) { "未分类" } else { $dir }
  $mapping += [pscustomobject]@{
    physical = $phys
    logical = $logi
    categoryPath = $cat
  }
}
Utf8NoBomWriteAllText $mappingOut (($mapping | ConvertTo-Json -Depth 20))

# 3) parse txt files with categoryPath and aggregate
$allQuestions = @()
$allErrors = @()

$relFiles = $mapping | Where-Object { $_.logical -and $_.logical.ToLowerInvariant().EndsWith(".txt") }
foreach ($m in $relFiles) {
  $phys = $m.physical
  $logi = $m.logical
  $categoryPath = $m.categoryPath
  $full = Join-Path $extractDir ($phys -replace '/', '\')

  if (!(Test-Path -LiteralPath $full)) {
    $allErrors += [pscustomobject]@{
      code = "FILE_MISSING"
      message = "File listed but not found after unzip"
      file = $logi
    }
    continue
  }

  Push-Location $extractDir
  try {
    $tmpOut = Join-Path $outAbs ("tmp." + ([Guid]::NewGuid().ToString("N")) + ".json")
    $cat = Join-Category $CategoryPrefix $categoryPath
    node $txtScript $phys --category $cat --out $tmpOut | Out-Null
    $parsed = ReadJsonFile $tmpOut
    Remove-Item -Force $tmpOut -ErrorAction SilentlyContinue

    foreach ($q in $parsed.questions) { $allQuestions += $q }
    foreach ($e in $parsed.errors) {
      $allErrors += [pscustomobject]@{
        code = $e.code
        message = $e.message
        file = $e.filePath
        line = $e.line
      }
    }
  } finally {
    Pop-Location
  }
}

Utf8NoBomWriteAllText $questionsOut (($allQuestions | ConvertTo-Json -Depth 50))

$now = (Get-Date).ToString("o")
$task = [pscustomobject]@{
  id = "local-$zipName"
  status = ($allErrors.Count -gt 0 ? "failed" : "done")
  progress = 100
  stage = "local-import"
  createdAt = $now
  updatedAt = $now
  result = @{
    parsedCount = $allQuestions.Count
    importedCount = 0
    skippedCount = 0
    errorCount = $allErrors.Count
  }
  errors = $allErrors
}

Utf8NoBomWriteAllText $taskOut (($task | ConvertTo-Json -Depth 50))

Write-Output ("outDir=" + $outAbs.Replace("\", "/"))
Write-Output ("importTask=" + $taskOut.Replace("\", "/"))
Write-Output ("questions=" + $questionsOut.Replace("\", "/"))
Write-Output ("mapping=" + $mappingOut.Replace("\", "/"))
Write-Output ("fileList=" + $fileList.Replace("\", "/"))
