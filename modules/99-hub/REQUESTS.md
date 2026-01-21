# 跨模块请求队列

当某模块需要改动别的模块目录内的文件时，请在这里新增一条请求，由总控窗口统一处理。

## 01-miniapp：修复题库页 require JSON 导致页面未注册
- 发起模块：`modules/99-hub`
- 目标模块：`modules/01-miniapp`
- 原因：在基础库 3.x（含稳定版 3.12.1）下，`pages/library/index.js` 里的 `require('../../mock/library-config.json')` 报错 `module 'mock/library-config.json.js' is not defined`，导致 app 初始化中断，进而出现 `Page "pages/course/index" has not been registered yet.`。
- 期望改动：
  - 将 `modules/01-miniapp/miniprogram/mock/library-config.json` 改为 `modules/01-miniapp/miniprogram/mock/library-config.js`（CommonJS：`module.exports = { ... }`）。
  - 将 `modules/01-miniapp/miniprogram/pages/library/index.js` 的 require 改为 `require('../../mock/library-config.js')`。
  - 同步修正 banner 示例里指向不存在页面的跳转（目前 JSON 内有 `/pages/news/index` 但 `pages/news/*` 不存在，建议改成已有页面或补齐注册页）。
- 影响评估：仅影响 mock 配置加载方式；不改动真实接口；可减少不同基础库版本下的兼容问题。

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

- [!] feat/01-miniapp-m7-home-commercial-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段 (blocked: conflict)
- [ ] feat/01-miniapp-autopilot-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [ ] feat/01-miniapp-favorite-local-winE2 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [ ] feat/01-miniapp-m7-news-tab-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [ ] feat/01-miniapp-mvp-practice-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [ ] feat/01-miniapp-mvp-star-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [ ] feat/01-miniapp-mvp-urlencode-winE → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [ ] feat/01-miniapp-mvp-wrong-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [ ] feat/02-backend-core-contract-draft → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [ ] feat/02-backend-core-question-read-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [ ] feat/04-admin-console-auth-skeleton → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [ ] feat/04-admin-console-news-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [x] feat/03-importer-validate-task-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [x] feat/04-admin-console-plans-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [x] feat/03-importer-gitignore-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [x] feat/01-miniapp-course-paywall-gating-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [!] feat/02-backend-core-me-profile-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段 (blocked: conflict)
- [x] feat/03-importer-keywords-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [x] feat/04-admin-console-dashboard-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [!] feat/04-admin-console-users-benefits-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段 (blocked: conflict)
- [x] feat/01-miniapp-library-online-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [x] feat/02-backend-core-cors-delete-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [x] feat/03-importer-import-local-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [!] feat/04-admin-console-questions-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段 (blocked: conflict)
- [x] feat/99-hub-window-supervisor → 99-hub：验收：`pwsh -NoProfile modules/99-hub/window_supervisor.ps1 -RunOnce -ForceFetch`
- [x] feat/02-backend-core-cors-delete-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [!] feat/04-admin-console-questions-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段 (blocked: conflict)
- [x] feat/01-miniapp-course-learned-toggle-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [x] feat/01-miniapp-course-progress-list-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [x] feat/01-miniapp-exam-result-metrics-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [x] feat/01-miniapp-library-preview-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [x] feat/02-backend-core-expose-requestid-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [x] feat/02-backend-core-records-mock-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [x] feat/03-importer-txt-meta-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [x] feat/03-importer-validate-ir-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [x] feat/03-importer-zip-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [x] feat/04-admin-console-banners-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [x] feat/04-admin-console-courses-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [x] feat/04-admin-console-svip-codes-v3 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [x] feat/01-miniapp-library-config-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [x] feat/02-backend-core-requestid-jsonerr-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [x] feat/03-importer-preview-w03-v1 → 03-importer：验收：见 modules/03-importer/CONVERSATION_LOG.txt 最新一段
- [x] feat/04-admin-console-ops-export-v1 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [x] feat/04-admin-console-config-export-v2 → 04-admin-console：验收：见 modules/04-admin-console/CONVERSATION_LOG.txt 最新一段
- [x] feat/01-miniapp-library-subject-gating-winE3 → 01-miniapp：验收：见 modules/01-miniapp/CONVERSATION_LOG.txt 最新一段
- [x] feat/02-backend-core-billing-order-query-codex → 02-backend-core：验收：见 modules/02-backend-core/CONVERSATION_LOG.txt 最新一段
- [x] feat/01-miniapp-library-swiper-winE3 → 01-miniapp：验收：见 `modules/01-miniapp/CONVERSATION_LOG.txt` 最新一段
- [x] `feat/99-hub-autoenqueue-from-module-logs` → 99-hub：daemon 自动从各模块日志入队（A 流程零转发）
- [x] `feat/99-hub-m1m2-checklist-mcp` → 99-hub：M1/M2 对齐清单 + MCP 小程序验收日志（合并后修复队列可读性）
- [x] `feat/01-miniapp-mvp-my-login-winE3` → 01-miniapp 我的页：登录本地缓存/展示信息/退出登录（MVP）
- [x] `feat/03-importer-mvp-w03` → 03-importer：目录层级解析 + OpenAPI + docx/pdf 解析（MVP w03）
- [x] `feat/01-miniapp-mvp-exam-winE3` → 01-miniapp MVP 答题闭环（验收见下方【合并请求】段落）

- [x] `feat/04-admin-console-autopilot-codex` → 已合并到 `main`（管理台原型 M1–M4）
- [x] `feat/02-backend-core-autopilot-codex` → 02-backend-core Autopilot（M1–M6：OpenAPI 草案 + 可跑的 Mock API + 证据脚本）

## 当前 UI 决策（锁定）
- Tab：`首页 / 题库 / 资讯 / 我的`
- 首页承载：学习入口 + 转化入口 + 运营/商业位（banner/推荐/套餐）

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
  - txt：
    - `node modules/03-importer/tools/parse-txt.mjs modules/03-importer/samples/txt/basic.txt --category "数学/一年级" > modules/03-importer/output/basic.parsed.json`
  - hierarchy：
    - `node modules/03-importer/tools/parse-hierarchy.mjs modules/03-importer/samples/hierarchy/file-list.txt > modules/03-importer/output/hierarchy.json`
  - docx：
    - `pwsh -File modules/03-importer/tools/parse-docx.ps1 modules/03-importer/samples/docx/basic.docx -Category "示例题库" > modules/03-importer/output/basic.docx.parsed.json`
  - pdf：
    - `node modules/03-importer/tools/parse-pdf.mjs modules/03-importer/samples/pdf/basic.pdf --category "示例题库" > modules/03-importer/output/basic.pdf.parsed.json`
  - ocr-review：
    - `node modules/03-importer/tools/prepare-ocr-review.mjs modules/03-importer/samples/ocr/image-list.txt --category "示例题库" > modules/03-importer/output/ocr.review.json`
  - api：
    - 查看 `modules/03-importer/api/import.openapi.yaml` 包含 `/import/upload` 与 `/import/status`

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

--- 2026-01-21 14:43 ---
