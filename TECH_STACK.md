# 统一技术栈标准（总控）

> 目的：多窗口并行开发时，避免“每个模块自己选一套”导致无法集成。
> 本文件记录“已定的标准”和“待定的决策点（Owner/截止时间）”。

## 已定（当前）

- 规格/变更：使用 OpenSpec（见 `openspec/`）
- 模块隔离：各窗口只改各自 `modules/<xx>/`（跨模块走 `modules/99-hub/REQUESTS.md`）
- 环境变更：统一同步到 `ENVIRONMENT.md`
- 接口优先：小程序先 Mock 跑通，后端确定后替换为真实 API（`modules/01-miniapp/miniprogram/config/index.js`）

## 建议统一（待确认）

> 下面是“建议默认值”，如你已决定/想换栈，告诉我，我会把它固化并同步到 OpenSpec。

- 语言：后端/导入/管理台统一 TypeScript
- API 契约：OpenAPI 3.1（单一来源放在 `modules/00-shared/contract/`）
- 包管理：pnpm（单仓多包）或 npm（先简单后演进）
- 数据库：Postgres（题库与作答记录天然适合关系型）
- ORM：Prisma（可选）
- Web 框架：Fastify / NestJS（可选；先以最小服务为准）

## 决策点（请你指定 Owner）

- [ ] 后端技术栈：Node/TS + 具体框架（Owner：____，截止：____）
- [ ] 数据库：是否 Postgres，是否需要 Redis（Owner：____，截止：____）
- [ ] 导入服务：是否独立进程/队列（Owner：____，截止：____）
- [ ] 管理后台：是否重做/用现成后台（Owner：____，截止：____）

