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

