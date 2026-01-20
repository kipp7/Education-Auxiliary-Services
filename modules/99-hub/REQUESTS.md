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

## 定稿 04-admin-console 管理台 RBAC 与接口契约（最小集）
- 发起模块：`modules/04-admin-console`
- 目标模块：`modules/99-hub`（如需落地共享契约目录，也请同步 `modules/00-shared`）
- 原因：管理台实现依赖权限模型与接口契约，需先对齐再编码，避免各模块各自定义导致无法集成。
- 期望改动：
  - 定义并冻结管理台角色/权限（建议以资源/动作维度）：如 `admin`、`ops` 等（最终以你们决定为准）
  - 明确鉴权方式（token 传递、失效策略）与通用错误码结构（供前端统一处理）
  - 定义并冻结管理台 MVP 接口（含 request/response、分页/排序、错误码、鉴权）：
    - 题库：科目 / 题库包 / 章节 / 题目列表（CRUD 以最小可用为准）
    - 导入：上传、任务列表、任务详情、错误报告下载
    - 用户/权限：管理员登录、角色绑定/查询（最小闭环即可）
- 影响评估：契约定稿后 `04-admin-console` 才能开始最小 UI/路由实现；同时可为 `03-importer`、`02-backend-core` 提供一致的管理端契约入口。

## 合并请求：04-admin-console 登录与权限最小骨架
- 发起模块：`modules/04-admin-console`
- 目标模块：`modules/99-hub`（总控合并到 `main`）
- 分支：`feat/04-admin-console-auth-skeleton`
- 原因：完成 `TASKS.md` 的“登录与权限（管理员）”最小骨架，提供可运行的路由与权限守卫占位，便于后续按契约接入真实接口。
- 变更范围：仅 `modules/04-admin-console/**`（外加本文件的请求条目）
- 验收方式：
  - `cd modules/04-admin-console/web`
  - `npm install`
  - `npm run dev`
  - 打开 `http://localhost:5174`，点击“开发登录”进入首页；退出后回到登录页

## 合并请求：04-admin-console 题库管理最小骨架
- 发起模块：`modules/04-admin-console`
- 目标模块：`modules/99-hub`（总控合并到 `main`）
- 分支：`feat/04-admin-console-question-bank-codex`
- 原因：完成 `TASKS.md` 的“题库管理：科目/题库包/章节/题目列表”最小骨架（本地示例数据 + 占位 CRUD），为后续按契约接入真实 API 做界面与交互准备。
- 变更范围：仅 `modules/04-admin-console/**`（外加本文件的请求条目）
- 验收方式：
  - `cd modules/04-admin-console/web`
  - `npm install`
  - `npm run dev`
  - 打开 `http://localhost:5174` → 开发登录 → 进入“题库管理”
  - 可新增/重命名/删除：科目、题库包、章节、题目；可点击“重置示例数据”
