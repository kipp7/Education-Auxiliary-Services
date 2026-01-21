# 02-backend-core 联调排障

## 1. 启动失败：端口占用

- 现象：`EADDRINUSE` 或无法监听 `3000`
- 处理：
  - 换端口：PowerShell 执行 `$env:PORT="3100"; npm run dev`
  - 查看占用：`netstat -ano | findstr :3000`，然后按 PID 结束进程

## 2. curl 在 PowerShell 下参数转义问题

- 建议统一使用 `curl.exe`（避免被 PowerShell 的 alias/参数解析影响）
- POST JSON 示例：

```powershell
curl.exe -sS -X POST "http://localhost:3000/auth/wechat" `
  -H "Content-Type: application/json" `
  -d '{\"code\":\"demo\"}'
```

## 3. 401 UNAUTHORIZED

- 现象：返回 `{ "code": "UNAUTHORIZED", ... }`
- 原因：缺少或错误的 `Authorization` 头
- 处理：
  - 先调用 `POST /auth/wechat` 获取 token（mock 返回 `demo-token`）
  - 再带上 `Authorization: Bearer demo-token` 调用需要鉴权的接口

## 4. 400 INVALID_ARGUMENT（非法 JSON）

- 现象：`message=Invalid JSON`
- 原因：请求体不是合法 JSON（常见于引号/反斜杠转义错误）
- 处理：用 `curl.exe` 并按上方示例构造 JSON 字符串

## 5. 证据脚本生成的临时文件

- `modules/02-backend-core/logs/.gitignore` 会忽略 `*-server.out.txt` / `*-server.err.txt`
- 证据脚本输出的 `m*-evidence.txt` 需要保留用于验收与复现

