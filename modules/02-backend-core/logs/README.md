# logs 说明

本目录用于存放可复现的联调证据文件（例如 `m*-evidence.txt`）。

## 证据文件

- `m*-evidence.txt`：由 `modules/02-backend-core/scripts/gen-evidence-*.ps1` 生成的证据日志
- 其它 `.md/.txt`：联动验收清单或手工记录

## 忽略规则

`logs/.gitignore` 会忽略证据脚本运行产生的临时 `*-server.out.txt` / `*-server.err.txt`，避免误提交。

