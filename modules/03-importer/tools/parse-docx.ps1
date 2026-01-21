param(
  [Parameter(Mandatory=$true, Position=0)]
  [string]$DocxPath,

  [Parameter(Mandatory=$false)]
  [string]$Category = "",

  [Parameter(Mandatory=$false)]
  [string]$SourcePath = "",

  [Parameter(Mandatory=$false)]
  [string]$OutJson = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Usage {
  Write-Error "Usage: pwsh -File modules/03-importer/tools/parse-docx.ps1 <docxPath> [-Category <path>] [-SourcePath <path>] [-OutJson <file>]"
  exit 2
}

if (-not $DocxPath) { Usage }

$resolved = Resolve-Path -LiteralPath $DocxPath
$docxFull = $resolved.Path

if (-not $SourcePath) {
  $SourcePath = $DocxPath
}

$txtParser = Resolve-Path -LiteralPath 'modules/03-importer/tools/parse-txt.mjs'

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("03-importer-docx-" + [System.Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

try {
  Expand-Archive -LiteralPath $docxFull -DestinationPath $tempRoot -Force

  $documentXmlPath = Join-Path $tempRoot 'word/document.xml'
  if (-not (Test-Path $documentXmlPath)) {
    throw "Missing word/document.xml in docx: $DocxPath"
  }

  [xml]$xml = Get-Content -Raw -Encoding UTF8 $documentXmlPath
  $ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
  $ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

  $paragraphs = $xml.SelectNodes('//w:document/w:body/w:p', $ns)
  $lines = New-Object System.Collections.Generic.List[string]

  foreach ($p in $paragraphs) {
    $texts = $p.SelectNodes('.//w:t', $ns)
    if ($texts -and $texts.Count -gt 0) {
      $line = ($texts | ForEach-Object { $_.'#text' }) -join ''
      $lines.Add($line)
    } else {
      $lines.Add('')
    }
  }

  $plainText = ($lines -join "`n")
  $tmpTxt = Join-Path $tempRoot 'extracted.txt'
  Set-Content -Encoding UTF8 -LiteralPath $tmpTxt -Value $plainText

  $node = Get-Command node -ErrorAction Stop
  $tmpOut = Join-Path $tempRoot 'parsed.json'

  $args = @(
    $txtParser.Path,
    $tmpTxt,
    '--category', $Category
    '--out', $tmpOut
  )

  & $node.Source @args | Out-Null
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

  $raw = Get-Content -LiteralPath $tmpOut -Raw -Encoding UTF8
  $parsed = $raw | ConvertFrom-Json -Depth 50
  $parsed.file = @{ path = ($SourcePath -replace '\\', '/') }
  if ($parsed.errors) {
    foreach ($e in $parsed.errors) {
      if ($e) { $e.filePath = ($SourcePath -replace '\\', '/') }
    }
  }

  $json = $parsed | ConvertTo-Json -Depth 50
  if ($OutJson) {
    $outAbs = [IO.Path]::GetFullPath($OutJson)
    $outDir = [IO.Path]::GetDirectoryName($outAbs)
    if ($outDir) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }
    [IO.File]::WriteAllText($outAbs, $json, [Text.UTF8Encoding]::new($false))
  } else {
    Write-Output $json
  }
} finally {
  Remove-Item -LiteralPath $tempRoot -Recurse -Force -ErrorAction SilentlyContinue
}
