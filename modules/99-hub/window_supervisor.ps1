param(
  [int]$IntervalSeconds = 30,
  [switch]$ForceFetch,
  [switch]$AutoContinue,
  [switch]$RunOnce,
  [string]$Remote = "origin",
  [string]$MainBranch = "main",
  [string]$OutboxDir = (Join-Path $PSScriptRoot "outbox"),
  [string]$StateFile = (Join-Path $PSScriptRoot "window_supervisor.state.json"),
  [string]$LogFile = (Join-Path $PSScriptRoot "window_supervisor.log"),
  [string[]]$Modules = @("01-miniapp", "02-backend-core", "03-importer", "04-admin-console")
)

$ErrorActionPreference = "Stop"

$utf8 = [System.Text.UTF8Encoding]::new()
$OutputEncoding = $utf8
[Console]::OutputEncoding = $utf8
[Console]::InputEncoding = $utf8

function Write-Log([string]$Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $line = "[$ts] $Message"
  Write-Host $line
  Add-Content -Path $LogFile -Value $line -Encoding UTF8
}

function Read-TextFromGit([string]$Spec) {
  try {
    $out = git show $Spec 2>$null
    if ($LASTEXITCODE -ne 0) { return "" }
    return (@($out) -join "`n")
  } catch {
    return ""
  }
}

function Load-State {
  if (-not (Test-Path $StateFile)) {
    return @{
      version = 1
      lastSeen = @{}
    }
  }
  try {
    return (Get-Content -Path $StateFile -Encoding UTF8 -Raw | ConvertFrom-Json -AsHashtable)
  } catch {
    return @{
      version = 1
      lastSeen = @{}
    }
  }
}

function Save-State($State) {
  $State | ConvertTo-Json -Depth 8 | Set-Content -Path $StateFile -Encoding UTF8
}

function Get-LatestRemoteBranchForModule([string]$ModuleDir) {
  $refs = @(
    git for-each-ref --format="%(committerdate:iso8601)|%(refname:short)" "refs/remotes/$Remote/feat/$ModuleDir-*" 2>$null
    | Where-Object { $_ -and $_.Trim() -ne "" }
  )
  if ($refs.Count -eq 0) { return $null }
  $latest = $refs | Sort-Object | Select-Object -Last 1
  $parts = $latest -split "\|", 2
  if ($parts.Count -lt 2) { return $null }
  $ref = $parts[1].Trim()
  if (-not $ref.StartsWith("$Remote/")) { return $null }
  return $ref.Substring($Remote.Length + 1)
}

function Is-MergedToMain([string]$Branch) {
  git merge-base --is-ancestor "$Remote/$Branch" $MainBranch | Out-Null
  return ($LASTEXITCODE -eq 0)
}

function Extract-MrBlock([string]$ConversationLogText) {
  if (-not $ConversationLogText) { return $null }
  $lines = @($ConversationLogText -split "`r?`n")

  $branch = $null
  $hasAcceptance = $false

  for ($i = $lines.Count - 1; $i -ge 0; $i--) {
    $t = $lines[$i].Trim()
    if (-not $branch -and $t -match '(?:[:：]|ï¼š)\s*(feat\/\S+)\s*$') { $branch = $Matches[1] }
    if ($t -match '^\s*(?:acceptance|\u9A8C\u6536\u65B9\u5F0F|\u9A8C\u6536|éªŒæ”¶)\s*(?:[:：]|ï¼š)') { $hasAcceptance = $true }
    if ($branch -and $hasAcceptance) { break }
  }

  if (-not $branch) { return $null }
  return @{
    branch = $branch
    hasAcceptance = $hasAcceptance
  }
}

function Write-Outbox([string]$ModuleDir, [string]$Title, [string]$Body) {
  New-Item -ItemType Directory -Force -Path $OutboxDir | Out-Null
  $path = Join-Path $OutboxDir "$ModuleDir.txt"
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $content = @(
    "--- $ts ---"
    $Title
    ""
    $Body
    ""
  ) -join "`n"
  Add-Content -Path $path -Value $content -Encoding UTF8
}

Write-Log "=== window_supervisor start (IntervalSeconds=$IntervalSeconds, ForceFetch=$ForceFetch, AutoContinue=$AutoContinue, Remote=$Remote) ==="

while ($true) {
  try {
    if ($ForceFetch) {
      git fetch --all --prune | Out-Null
    }

    $state = Load-State
    if (-not $state.lastSeen) { $state.lastSeen = @{} }

    foreach ($moduleDir in $Modules) {
      $branch = Get-LatestRemoteBranchForModule $moduleDir
      if (-not $branch) { continue }

      $head = (git rev-parse "$Remote/$branch" 2>$null).Trim()
      if (-not $head) { continue }

      $key = "$moduleDir|$branch"
      $last = $null
      if ($state.lastSeen.ContainsKey($key)) { $last = $state.lastSeen[$key] }
      if ($last -eq $head) { continue }

      $state.lastSeen[$key] = $head
      Save-State $state

      $merged = Is-MergedToMain $branch
      $logPath = "modules/$moduleDir/CONVERSATION_LOG.txt"
      $logText = Read-TextFromGit "$Remote/$branch`:$logPath"
      $mr = Extract-MrBlock $logText

      $status = if ($merged) { "merged" } else { "unmerged" }
      Write-Log "Detected update: module=$moduleDir branch=$branch head=$head status=$status"

      if (-not $mr) {
        Write-Outbox $moduleDir "检测到新提交（$branch）" "请按模板在 `$logPath` 末尾追加：分支/验收/变更点，然后再 push。"
        continue
      }

      if ($merged) {
        Write-Outbox $moduleDir "已检测到新提交（但分支已合并过）" "分支：$($mr.branch)`n说明：该分支在 main 中已存在（[x]），AutoEnqueue 会跳过；如有新功能请新开 `feat/$moduleDir-...` 或 `-v2` 分支。"
        continue
      }

      $next = if ($AutoContinue) { "继续" } else { "等待你的指令" }
      Write-Outbox $moduleDir "已完成一次提交：$($mr.branch)" @"
验收：请看 `modules/$moduleDir/CONVERSATION_LOG.txt` 最新一段。
建议下一步：继续按 `modules/$moduleDir/TASKS.md` 从上到下做下一条未完成任务。
状态：$next
"@
    }
  } catch {
    Write-Log ("ERROR: " + $_.Exception.Message)
  }

  if ($RunOnce) { break }
  Start-Sleep -Seconds $IntervalSeconds
}

