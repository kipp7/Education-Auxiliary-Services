# 02-backend-core

本模块提供后端 API 的 Mock 实现与契约草案，用于前端/小程序联调。

## 快速开始

```bash
cd modules/02-backend-core
npm run dev
```

健康检查：

```bash
curl.exe http://localhost:3000/health
```

## 契约

- OpenAPI 草案：`modules/02-backend-core/contract/mvp.openapi.yaml`

## 环境变量

- 说明：`modules/02-backend-core/ENVIRONMENT.md`

## 证据脚本（如存在）

优先使用 `modules/02-backend-core/scripts/` 下的 `gen-evidence-*.ps1`，执行后会在 `modules/02-backend-core/logs/` 生成对应证据文件。

