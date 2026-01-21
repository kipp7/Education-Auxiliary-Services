# scripts 使用说明

本目录用于放置可复现的验收/证据脚本（PowerShell）。

## 约定

- 脚本命名：`gen-evidence-*.ps1`
- 输出目录：`modules/02-backend-core/logs/`
- 端口：脚本通常会随机选择端口并通过 `PORT` 环境变量启动服务

## 运行

在仓库根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File modules/02-backend-core/scripts/gen-evidence-xxx.ps1
```

执行结束后检查对应 `modules/02-backend-core/logs/m*-evidence.txt`。

