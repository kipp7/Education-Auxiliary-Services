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
- 原因：`modules/02-backend-core` 的实现依赖统一的接口契约、错误码与鉴权方式，需要先对齐再编码。
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

## 合并请求：引入 02-backend-core MVP OpenAPI 草案
- 发起模块：`modules/02-backend-core`
- 目标模块：`modules/99-hub`
- 分支：`feat/02-backend-core-contract-draft`
- 变更点：提供可审阅的 OpenAPI 3.1 草案，作为 99-hub 定稿时的输入（文件见 `modules/02-backend-core/contract/mvp.openapi.yaml`）。
- 验收方式：
  - 打开并评审 `modules/02-backend-core/contract/mvp.openapi.yaml`，确认覆盖 `modules/02-backend-core/TASKS.md` 的 MVP 接口清单。
  - 确认鉴权 token 传递方式（Authorization Bearer）与错误响应结构是否符合 99-hub 统一口径。

## 合并请求：细化 `POST /auth/wechat` 草案
- 发起模块：`modules/02-backend-core`
- 目标模块：`modules/99-hub`
- 分支：`feat/02-backend-core-auth-wechat-codex`
- 变更点：
  - 细化 OpenAPI 中 `AuthWechatResponse` 字段（`expiresIn`/`userId`/`isNewUser`）：`modules/02-backend-core/contract/mvp.openapi.yaml`
  - 补充接口说明：`modules/02-backend-core/contract/auth.wechat.md`
- 验收方式：
  - 阅读 `modules/02-backend-core/contract/auth.wechat.md`，确认请求/响应与 token 传递方式符合预期
  - 阅读 `modules/02-backend-core/contract/mvp.openapi.yaml`，确认 `AuthWechatResponse.required` 包含 `expiresIn`

