# 模块划分与协作约定

## 目录结构

- `modules/01-miniapp/`：微信小程序（展示/做题/记录/我的/资讯等）
- `modules/02-backend-core/`：后端核心（用户、权限、题库、作答记录 API）
- `modules/03-importer/`：导入/解析（文件夹/zip 上传、解析、入库）
- `modules/04-admin-console/`：管理端（如需要自建后台 UI）
- `modules/99-hub/`：总控/集成（接口契约、联调清单、CI、Release notes）

## 任务看板入口

- `modules/01-miniapp/TASKS.md`
- `modules/02-backend-core/TASKS.md`
- `modules/03-importer/TASKS.md`
- `modules/04-admin-console/TASKS.md`
- `modules/99-hub/TASKS.md`

## 防冲突规则（强制）

- 每个 Codex CLI 窗口只允许在自己模块目录内改动文件。
- 如必须跨模块改动：在 `modules/99-hub/REQUESTS.md` 里提请求，由总控窗口合并处理。
- 每个模块目录内的 `KEYWORDS.md` 记录关键词/职责边界，避免重复造轮子。

## 分支建议

- 每个模块用独立分支：`module/01-miniapp`、`module/02-backend-core` …
- 合并到 `main` 只由总控窗口执行（避免多窗口同时改同一文件）。
