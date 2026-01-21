Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Fail([string]$msg) {
  Write-Error $msg
  exit 1
}

function Require-Cmd([string]$name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $cmd) { Fail "Missing command: $name" }
  return $cmd
}

function Ensure-Dir([string]$p) {
  if (!(Test-Path -LiteralPath $p)) { New-Item -ItemType Directory -Force -Path $p | Out-Null }
}

function Read-JsonUtf8([string]$p) {
  $raw = Get-Content -LiteralPath $p -Raw -Encoding UTF8
  return $raw | ConvertFrom-Json -Depth 50
}

$node = Require-Cmd "node"

$repoRoot = (Get-Location).Path
$toolsDir = Join-Path $repoRoot "modules/03-importer/tools"
$samplesDir = Join-Path $repoRoot "modules/03-importer/samples"
$outputDir = Join-Path ([System.IO.Path]::GetTempPath()) ("03-importer-run-samples-" + [Guid]::NewGuid().ToString("N"))
Ensure-Dir $outputDir

Write-Output ("outDir=" + $outputDir.Replace("\", "/"))

$txtOut = Join-Path $outputDir "basic.parsed.json"
$previewOut = Join-Path $outputDir "basic.preview.json"
$hierOut = Join-Path $outputDir "hierarchy.json"
$pdfOut = Join-Path $outputDir "basic.pdf.parsed.json"
$ocrOut = Join-Path $outputDir "ocr.review.json"
$docxOut = Join-Path $outputDir "basic.docx.parsed.json"
$irValidOut = Join-Path $outputDir "basic.parsed.validation.json"
$taskValidOut = Join-Path $outputDir "import-task.sample.validation.json"
$keywordsOut = Join-Path $outputDir "keywords.json"
$unpackOutDir = Join-Path $outputDir "unpack-basic"
$unpackFileList = Join-Path $outputDir "basic.zip.file-list.txt"
$manifestOut = Join-Path $outputDir "import-manifest.json"

& $node.Source (Join-Path $toolsDir "parse-txt.mjs") (Join-Path $samplesDir "txt/basic.txt") --category "数学/一年级" --out $txtOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "parse-txt failed" }

& $node.Source (Join-Path $toolsDir "preview-ir.mjs") $txtOut --limit 2 --out $previewOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "preview-ir failed" }

& $node.Source (Join-Path $toolsDir "parse-hierarchy.mjs") (Join-Path $samplesDir "hierarchy/file-list.txt") --out $hierOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "parse-hierarchy failed" }

& $node.Source (Join-Path $toolsDir "parse-pdf.mjs") (Join-Path $samplesDir "pdf/basic.pdf") --category "示例题库" --out $pdfOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "parse-pdf failed" }

& $node.Source (Join-Path $toolsDir "prepare-ocr-review.mjs") (Join-Path $samplesDir "ocr/image-list.txt") --category "示例题库" --out $ocrOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "prepare-ocr-review failed" }

pwsh -NoProfile -File (Join-Path $toolsDir "parse-docx.ps1") (Join-Path $samplesDir "docx/basic.docx") -Category "示例题库" -SourcePath "modules/03-importer/samples/docx/basic.docx" -OutJson $docxOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "parse-docx failed" }

& $node.Source (Join-Path $toolsDir "validate-ir.mjs") $txtOut --out $irValidOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "validate-ir failed" }

& $node.Source (Join-Path $toolsDir "validate-import-task.mjs") "modules/03-importer/output/import-task.sample.json" --out $taskValidOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "validate-import-task failed" }

& $node.Source (Join-Path $toolsDir "show-keywords.mjs") --out $keywordsOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "show-keywords failed" }

# zip unpack + manifest (idempotency helpers)
$basicZip = Join-Path $samplesDir "import-local/basic.zip"
$basicSrc = Join-Path $samplesDir "import-local/basic_src"
if (!(Test-Path -LiteralPath $basicZip)) { Fail "Missing sample zip: $basicZip" }
if (!(Test-Path -LiteralPath $basicSrc)) { Fail "Missing sample src folder: $basicSrc" }

pwsh -NoProfile -File (Join-Path $toolsDir "unpack-zip.ps1") $basicZip -OutDir $unpackOutDir -FileListOut $unpackFileList | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "unpack-zip failed" }

& $node.Source (Join-Path $toolsDir "make-import-manifest.mjs") --root $basicSrc --source "modules/03-importer/samples/import-local/basic.zip" --out $manifestOut | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "make-import-manifest failed" }

# Quick summaries
$txt = Read-JsonUtf8 $txtOut
$prev = Read-JsonUtf8 $previewOut
$taskCheck = Read-JsonUtf8 $taskValidOut
$manifest = Read-JsonUtf8 $manifestOut

Write-Output ("txt.questions=" + $txt.questions.Count)
Write-Output ("preview.count=" + $prev.previewCount)
Write-Output ("importTask.sample.ok=" + $taskCheck.ok)
Write-Output ("manifest.fileCount=" + $manifest.fileCount)
Write-Output ("manifest.importHash=" + $manifest.importHash)

Write-Output "ok=true"
