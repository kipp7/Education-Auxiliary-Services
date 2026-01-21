$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$port = Get-Random -Minimum 3200 -Maximum 3999
$env:PORT = "$port"
$logPath = Join-Path $logDir "m14-evidence.txt"

function Append([string]$text) {
  $text | Out-File -Append -Encoding utf8 $logPath
}

"# M14 evidence" | Out-File -Encoding utf8 $logPath
Append ("GeneratedAt=" + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
Append ("PORT=" + $port)

$serverArg = "src/server.js"
$serverOut = Join-Path $logDir "m14-server.out.txt"
$serverErr = Join-Path $logDir "m14-server.err.txt"
"" | Out-File -Encoding utf8 $serverOut
"" | Out-File -Encoding utf8 $serverErr

$proc = Start-Process -FilePath node `
  -ArgumentList $serverArg `
  -WorkingDirectory $root `
  -RedirectStandardOutput $serverOut `
  -RedirectStandardError $serverErr `
  -PassThru -WindowStyle Hidden

function Run([string]$display, [scriptblock]$cmd) {
  Append ""
  Append ("$ " + $display)
  $previous = $ErrorActionPreference
  try {
    $ErrorActionPreference = "Continue"
    $out = & $cmd 2>&1 | Out-String
    Append ($out.TrimEnd())
    Append ("exit=" + $LASTEXITCODE)
    return $out.TrimEnd()
  } finally {
    $ErrorActionPreference = $previous
  }
}

try {
  # Wait until server is ready (or timeout)
  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 500
    if ($proc.HasExited) { throw "Server exited early" }
    $previous = $ErrorActionPreference
    try {
      $ErrorActionPreference = "Continue"
      $probe = & curl.exe -sS --max-time 1 "http://127.0.0.1:$port/health" 2>&1 | Out-String
      if ($probe -like '*"ok":true*') { $ready = $true; break }
    } finally {
      $ErrorActionPreference = $previous
    }
  }
  if (-not $ready) { throw "Server did not become ready" }

  Run "curl -X POST http://localhost:$port/auth/wechat" {
    curl.exe -sS -X POST "http://localhost:$port/auth/wechat" -H "Content-Type: application/json" -d '{\"code\":\"demo\"}'
  }

  $authHeader = "Authorization: Bearer demo-token"
  Run "GET /favorites (empty)" { curl.exe -sS "http://localhost:$port/favorites" -H $authHeader }
  Run "POST /favorites" { curl.exe -sS -X POST "http://localhost:$port/favorites" -H $authHeader -H "Content-Type: application/json" -d '{\"questionId\":\"q-1\"}' }
  Run "GET /favorites (after add)" { curl.exe -sS "http://localhost:$port/favorites" -H $authHeader }
  Run "DELETE /favorites" { curl.exe -sS -X DELETE "http://localhost:$port/favorites?questionId=q-1" -H $authHeader }
  Run "GET /favorites (after delete)" { curl.exe -sS "http://localhost:$port/favorites" -H $authHeader }
}
finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Wait-Process -Id $proc.Id -ErrorAction SilentlyContinue
  Remove-Item Env:PORT -ErrorAction SilentlyContinue
  Remove-Item -Force -ErrorAction SilentlyContinue $serverOut
  Remove-Item -Force -ErrorAction SilentlyContinue $serverErr
}

Append ""
Append "OK"

