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

---

## 合并队列（总控窗口执行）
> 规则：所有窗口只 push 自己的 `feat/*` 分支；总控窗口按优先级合并进 `main`。

- [x] `feat/01-miniapp-mvp-exam-winE3` → 01-miniapp MVP 答题闭环（验收见下方【合并请求】段落）
- [x] `feat/01-miniapp-mvp-my-login-winE3` → 01-miniapp 我的页：登录本地缓存/展示信息/退出登录（MVP）

- [ ] `feat/02-backend-core-autopilot-codex` → 02-backend-core Autopilot（M1–M6：OpenAPI 草案 + 可跑的 Mock API + 证据脚本）
- [ ] `feat/03-importer-mvp-w03` → 03-importer：目录层级解析 + OpenAPI + docx/pdf 解析（MVP w03）

- [x] `feat/04-admin-console-autopilot-codex` → 已合并到 `main`（管理台原型 M1–M4）
- [ ] `feat/04-admin-console-autopilot-codex` → 04-admin-console：M9 试题管理（最新提交继续合入 main）

## 当前 UI 决策（锁定）
- Tab：`首页 / 题库 / 资讯 / 我的`
- 首页承载：学习入口 + 转化入口 + 运营/商业位（banner/推荐/套餐）

## M1/M2：接口契约 / 数据结构 / 错误码（对齐清单）
> 目的：让 01-miniapp/03-importer/04-admin-console 与 02-backend-core 的契约对齐，避免“各写各的”导致返工。

### 1) 契约产物（单一真源）
- [ ] 契约形式：OpenAPI 3.1（YAML）为主，必要时用 JSON Schema 复用对象定义
- [ ] 真源文件位置：`modules/02-backend-core/contract/mvp.openapi.yaml`
- [ ] 其他模块只“引用/校验/生成”，不复制粘贴（避免漂移）

### 2) 通用返回结构（建议统一）
- [ ] 成功：`{ ok: true, data: <T>, traceId?: string }`
- [ ] 失败：`{ ok: false, error: { code: string, message: string, details?: any }, traceId?: string }`
- [ ] HTTP 状态码：业务错误优先用 4xx/5xx；不把所有错误都塞进 200

### 3) 错误码规范（建议统一）
- [ ] `error.code` 使用稳定的字符串（便于前端/导入器分支处理），示例：
  - `AUTH_UNAUTHORIZED` / `AUTH_FORBIDDEN` / `AUTH_TOKEN_EXPIRED`
  - `VALIDATION_ERROR` / `NOT_FOUND` / `CONFLICT`
  - `RATE_LIMITED` / `INTERNAL_ERROR`
- [ ] 小程序处理策略对齐：哪些 toast、哪些跳登录、哪些允许重试（给出最小表格）

### 4) 鉴权与登录（最小闭环）
- [ ] `POST /auth/wechat`：请求 `code`，响应 `token + user`
- [ ] token 传递：`Authorization: Bearer <token>`
- [ ] 用户信息字段最小集（01-miniapp 已在 Mock 使用）：`realname` / `nickName` / `department` / `avatarUrl?`

### 5) 题目通用数据结构（M2 核心）
- [ ] `Question` 最小字段：`id` / `stage` / `subject` / `unit?` / `type` / `stem` / `options?` / `answer` / `analysis?` / `assets?`
- [ ] `type` 枚举：单选/多选/判断/填空/简答（先定最小，后扩展）
- [ ] “作答提交”结构：按题型区分答案载荷（避免前端/后端各自乱造）

### 6) 练习/作答闭环（M1/M2 交叉）
- [ ] 会话：创建练习 / 拉题 / 提交 / 结算（接口与字段确认）
- [ ] 错题/收藏：最小读写接口（可后置实现，但先定契约）

---

## 合并请求：01-miniapp MVP 答题闭环
- 发起模块：`modules/01-miniapp`
- 目标模块：`main`
- 分支：`feat/01-miniapp-mvp-exam-winE3`
- 原因：01-miniapp 窗口仅修改自身模块目录，需 99-hub 代为发起/跟进 MR。
- 验收方式（建议）：
  - `git fetch origin && git checkout feat/01-miniapp-mvp-exam-winE3`
  - 打开微信开发者工具运行小程序（开发环境）
  - 走通 tabBar：首页 → 题库 → 答题 → 我的，并在“答题”页完成一次练习/提交（如页面提供入口）
  - 检查控制台无阻断性报错（warnings 可记录）
- 备注：如需后端契约/接口配合，请在本文件补充依赖项。

## 合并请求：01-miniapp 我的页登录（MVP）
- 发起模块：`modules/01-miniapp`
- 目标模块：`main`
- 分支：`feat/01-miniapp-mvp-my-login-winE3`（commit: 999a660）
- 验收方式（建议）：
  - `git fetch origin && git checkout feat/01-miniapp-mvp-my-login-winE3`
  - 微信开发者工具运行小程序（开发环境）
  - 进入“我的”页：展示 realname/nickName + department（有则显示）
  - 点击“退出登录”：清空本地 userInfo（Mock）
  - 启动页 `USE_MOCK` 下不强行调用 `wx.getUserInfo`（避免未授权时报错）

## 合并请求：03-importer MVP w03
- 发起模块：`modules/03-importer`
- 目标模块：`main`
- 分支：`feat/03-importer-mvp-w03`
- 验收方式（建议）：
  - `git fetch origin && git checkout feat/03-importer-mvp-w03`
  - 按 `modules/03-importer/CONVERSATION_LOG.txt` 的“验收路径/命令清单”执行（关注：OpenAPI/目录层级解析/docx/pdf 解析可复现）

## 合并请求：02-backend-core Autopilot（M1–M6）
- 发起模块：`modules/02-backend-core`
- 目标模块：`main`
- 分支：`feat/02-backend-core-autopilot-codex`
- 原因：提供可跑通的小程序联调 Mock API（含 /auth/wechat、题库树、作答提交、学习记录、内容/商业化接口、进度/错题/收藏），并输出可复现证据。
- 验收方式（建议，Windows/PowerShell）：
  - `git fetch origin && git checkout feat/02-backend-core-autopilot-codex`
  - `cd modules/02-backend-core`
  - `npm run dev`（另开窗口保持运行）
  - `curl.exe http://localhost:3000/health`
  - （可选，一键证据）
    - `powershell -ExecutionPolicy Bypass -File .\\scripts\\gen-evidence.ps1`
    - `powershell -ExecutionPolicy Bypass -File .\\scripts\\gen-evidence-m6.ps1`
- 证据/输出：
  - `modules/02-backend-core/contract/mvp.openapi.yaml`
  - `modules/02-backend-core/logs/m3-curl.txt`
  - `modules/02-backend-core/logs/m4-miniapp-checklist.md`
  - `modules/02-backend-core/logs/m5-evidence.txt`
  - `modules/02-backend-core/logs/m6-evidence.txt`

--- 2026-01-21 ---
