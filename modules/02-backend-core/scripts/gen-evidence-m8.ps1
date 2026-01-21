$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $root "logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$port = Get-Random -Minimum 3200 -Maximum 3999
$env:PORT = "$port"
$logPath = Join-Path $logDir "m8-evidence.txt"

function Append([string]$text) {
  $text | Out-File -Append -Encoding utf8 $logPath
}

"# M8 evidence" | Out-File -Encoding utf8 $logPath
Append ("GeneratedAt=" + (Get-Date -Format "yyyy-MM-dd HH:mm:ss"))
Append ("PORT=" + $port)

$serverArg = "src/server.js"
$serverOut = Join-Path $logDir "m8-server.out.txt"
$serverErr = Join-Path $logDir "m8-server.err.txt"
"" | Out-File -Encoding utf8 $serverOut
"" | Out-File -Encoding utf8 $serverErr

$proc = Start-Process -FilePath node `
  -ArgumentList $serverArg `
  -WorkingDirectory $root `
  -RedirectStandardOutput $serverOut `
  -RedirectStandardError $serverErr `
  -PassThru -WindowStyle Hidden

$authHeader = "Authorization: Bearer demo-token"

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
    if ($proc.HasExited) {
      Append ""
      Append ("ERROR: server process exited early (code=" + $proc.ExitCode + ")")
      if (Test-Path $serverErr) {
        Append "--- server stderr ---"
        (Get-Content -Raw -ErrorAction SilentlyContinue $serverErr) | ForEach-Object { Append $_ }
      }
      throw "Server exited early"
    }
    $previous = $ErrorActionPreference
    try {
      $ErrorActionPreference = "Continue"
      $probe = & curl.exe -sS --max-time 1 "http://127.0.0.1:$port/health" 2>&1 | Out-String
      if ($probe -like '*"ok":true*') { $ready = $true; break }
    } finally {
      $ErrorActionPreference = $previous
    }
  }
  if (-not $ready) {
    Append ""
    Append "ERROR: server did not become ready"
    throw "Server did not become ready"
  }

  Run "curl http://localhost:$port/health" { curl.exe -sS "http://localhost:$port/health" }
  Run "curl -X POST http://localhost:$port/auth/wechat" { curl.exe -sS -X POST "http://localhost:$port/auth/wechat" -H "Content-Type: application/json" -d '{\"code\":\"demo\"}' }

  $createRaw = Run "curl -X POST http://localhost:$port/billing/order" { curl.exe -sS -X POST "http://localhost:$port/billing/order" -H $authHeader -H "Content-Type: application/json" -d '{\"planId\":\"plan-1\"}' }
  $createObj = $null
  try { $createObj = $createRaw | ConvertFrom-Json } catch { }
  if (-not $createObj -or -not $createObj.orderId) { throw "Missing orderId in create order response" }
  $orderId = [string]$createObj.orderId

  Run "curl http://localhost:$port/billing/order/$orderId" { curl.exe -sS "http://localhost:$port/billing/order/$orderId" -H $authHeader }
  Run "curl -X POST http://localhost:$port/billing/payment/callback" { curl.exe -sS -X POST "http://localhost:$port/billing/payment/callback" -H "Content-Type: application/json" -d ('{\"orderId\":\"' + $orderId + '\",\"status\":\"PAID\"}') }
  Run "curl http://localhost:$port/billing/order/$orderId (after callback)" { curl.exe -sS "http://localhost:$port/billing/order/$orderId" -H $authHeader }
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

