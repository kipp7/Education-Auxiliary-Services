# 02-backend-core FAQ

## Q: token 从哪来？

A: 调用 `POST /auth/wechat`，Mock 会返回 `demo-token`；后续请求带上 `Authorization: Bearer demo-token`。

## Q: 为什么我一直 401？

A: 需要鉴权的接口必须带 `Authorization` 头；可先跑证据脚本验证：

`powershell -ExecutionPolicy Bypass -File modules/02-backend-core/scripts/gen-evidence.ps1`

## Q: PowerShell 下 curl 报错/参数不生效？

A: 建议使用 `curl.exe` 并注意 JSON 字符串转义，详见 `modules/02-backend-core/TROUBLESHOOTING.md`。

## Q: 证据脚本输出在哪？

A: `modules/02-backend-core/logs/`，一般为 `m*-evidence.txt`。

