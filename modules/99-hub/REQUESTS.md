# 跨模块请求队列

当某模块需要改动别的模块目录内的文件时，请在这里新增一条请求，由总控窗口统一处理。

模板：

```markdown
## 请求标题
- 发起模块：`modules/xx-...`
- 目标模块：`modules/yy-...`
- 原因：
- 期望改动：
- 影响评估：
```

## 定稿 02-backend-core MVP API 契约（OpenAPI/Schema）
- 发起模块：`modules/02-backend-core`
- 目标模块：`modules/99-hub`（如需落地到共享契约目录，也请同步 `modules/00-shared`）
- 原因：`02-backend-core` 的实现依赖统一的接口契约、错误码与鉴权方式，需要先对齐再编码。
- 期望改动：
  - 明确契约单一来源（建议 OpenAPI 3.1），以及存放路径与发布方式（供 miniapp mock/替换使用）
  - 定义并冻结以下接口（含 request/response、错误码、鉴权头/传参）：
    - `POST /auth/wechat`：code → session/token
    - `GET /subjects`
    - `GET /packages?subjectId=...`
    - `GET /chapters?packageId=...`
    - `GET /questions?chapterId=...&mode=...&limit=...`
    - `POST /answers/submit`
    - `GET /progress?packageId=...`
- 影响评估：契约定稿后 `02-backend-core` 才能开始最小服务与路由实现；`01-miniapp` 可按契约调整 mock/调用。

## 对齐导入任务模型（ImportTask）
- 发起模块：`modules/03-importer`
- 目标模块：`modules/99-hub`（汇总）/ `modules/02-backend-core`
- 原因：`03-importer` 已起草导入任务字段与状态机，用于后续 `GET /import/status` 契约与落库实现，需要总控确认口径以避免返工。
- 期望改动：
  - 总控确认 ImportTask 字段与状态机：`progress` 精度（0~100 vs 0~1）、`stage` 枚举、错误报告落地方式、`createdBy`/权限等
  - 需要时在 OpenSpec/接口契约中落地统一版本（作为各模块实现依据）
- 影响评估：涉及后端接口返回结构与任务表设计；若不统一，后续联调会频繁返工。

## 合并请求：选择契约形式（OpenAPI 3.1）
- 分支：`feat/99-hub-contract-choice`
- 模块：`modules/99-hub`
- 变更摘要：更新契约形式为 OpenAPI 3.1，并在 TASKS 勾选完成
- 验收方式：
  - `git fetch && git checkout feat/99-hub-contract-choice`
  - 查看 `modules/99-hub/CONTRACT.md` 与 `modules/99-hub/TASKS.md`
  - 运行 `powershell -NoProfile -ExecutionPolicy Bypass -File modules/99-hub/check-scope.ps1`
