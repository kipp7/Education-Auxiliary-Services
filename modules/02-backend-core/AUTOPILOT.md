# 02-backend-core 挂机执行指南（窗口一次性跑完）

目标：先把“接口契约 + 最小服务骨架”跑通，供小程序联调。

## 0. 约束
- 只改 `modules/02-backend-core/**`
- 先写契约，再写实现；跨模块对齐写到 `modules/99-hub/REQUESTS.md`

## 1. 开工指令（一次）
```bash
git fetch --all
git checkout main
git pull --rebase origin main
git checkout -b feat/02-backend-core-mvp
```

## 2. 挂机里程碑

### M1：契约定稿草案（OpenAPI）
- 输出：`modules/02-backend-core/contract/mvp.openapi.yaml`
- 覆盖：`/auth/wechat`、题库树、题目、视频列表/进度、SVIP 绑定、学习记录、统一错误码

### M2：最小服务骨架（不要求落库）
- 输出：项目结构/路由骨架/鉴权中间件占位
- 先返回 mock 数据，保证小程序可跑通

### M3：端到端 Mock API（可被小程序真正调用）
> 目标：让小程序把 `USE_MOCK` 切到 `false` 后，至少能跑通：题库树→题目→提交作答→学习记录（全是 mock 返回也行）。
- [ ] `/subjects` `/packages` `/chapters`
- [ ] `/questions`（按 chapterId 或随机）
- [ ] `/videos` `/videos/progress`
- [ ] `/activation/redeem` `/me/entitlements`
- [ ] `/me/learning-records`
- [ ] `/content/banners` `/content/news` `/content/news/:id`
- [ ] `/content/recommendations` `/billing/plans`（先 mock）

### M4：联动验收记录（无 MCP 版）
> 目标：提供可复用的联动验收路径与记录模板，方便总控/测试按步骤验证。
- 输出：`modules/02-backend-core/logs/m4-miniapp-checklist.md`
- 验收：按 checklist 执行并把关键现象/错误码记录到文件中（可先留空，后续补充）

### M5：一键生成证据日志（脚本）
> 目标：减少人工复制粘贴命令导致的“证据不可用”，一键生成可提交的证据文件。
- 输出：`modules/02-backend-core/logs/m5-evidence.txt`
- 执行：`powershell -ExecutionPolicy Bypass -File modules/02-backend-core/scripts/gen-evidence.ps1`

### M6：补齐 MVP 扩展接口（进度/错题/收藏）
> 目标：对齐 `TASKS.md` 的 MVP 需求，补齐最常用的进度与错题/收藏接口（先 mock）。
- 输出：契约更新 + Mock 路由 + 证据文件
  - `modules/02-backend-core/contract/mvp.openapi.yaml`
  - `modules/02-backend-core/src/server.js`
  - `modules/02-backend-core/logs/m6-evidence.txt`
  - `modules/02-backend-core/scripts/gen-evidence-m6.ps1`

### M7：补齐商业化下单接口（mock）
> 目标：对齐 `TASKS.md` 的商业化 MVP 需求，补齐创建订单接口（先 mock）。
- 输出：契约更新 + Mock 路由 + 证据文件
  - `modules/02-backend-core/contract/mvp.openapi.yaml`
  - `modules/02-backend-core/src/server.js`
  - `modules/02-backend-core/logs/m7-evidence.txt`
  - `modules/02-backend-core/scripts/gen-evidence-m7.ps1`

### M8：预留订单查询/支付回调（mock）
> 目标：按 `TASKS.md` 预留“订单查询/支付回调”路由与错误码结构（先 mock，便于后续接真支付）。
- 输出：契约更新 + Mock 路由 + 证据文件
  - `modules/02-backend-core/contract/mvp.openapi.yaml`
  - `modules/02-backend-core/src/server.js`
  - `modules/02-backend-core/logs/m8-evidence.txt`
  - `modules/02-backend-core/scripts/gen-evidence-m8.ps1`

### M9：统一 requestId + JSON 解析错误（mock）
> 目标：所有响应携带 `X-Request-Id`，并将非法 JSON 请求统一为 400（便于前端联调定位）。
- 输出：服务实现 + 证据文件
  - `modules/02-backend-core/src/server.js`
  - `modules/02-backend-core/logs/m9-evidence.txt`
  - `modules/02-backend-core/scripts/gen-evidence-m9.ps1`

### M10：补齐 /records（mock）
> 目标：补齐契约已包含的学习记录接口（GET/POST /records），用于联调与后续落库替换。
- 输出：服务实现 + 证据文件
  - `modules/02-backend-core/src/server.js`
  - `modules/02-backend-core/logs/m10-evidence.txt`
  - `modules/02-backend-core/scripts/gen-evidence-m10.ps1`

## 3. 输出与汇报
每完成一个里程碑才提交/推送，并在 `modules/02-backend-core/CONVERSATION_LOG.txt` 记录验收方式（curl 示例）。

## 4. 联动验收（建议，若 MCP 可用）
如果你当前窗口能连上微信小程序 MCP：
- 在小程序侧用 `mp_getLogs` 检查 API 失败日志（例如 401/403/5xx）
- 把关键错误码与请求路径整理到 `modules/99-hub/REQUESTS.md`，让契约与实现一致
