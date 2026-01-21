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
- [ ] `feat/01-miniapp-mvp-my-login-winE3` → 01-miniapp 我的页：登录本地缓存/展示信息/退出登录（MVP）
- [ ] `feat/03-importer-mvp-w03` → 03-importer：目录层级解析 + OpenAPI + docx/pdf 解析（MVP w03）
- [x] `feat/01-miniapp-mvp-exam-winE3` → 01-miniapp MVP 答题闭环（验收见下方【合并请求】段落）

- [x] `feat/04-admin-console-autopilot-codex` → 已合并到 `main`（管理台原型 M1–M4）

## 当前 UI 决策（锁定）
- Tab：`首页 / 题库 / 资讯 / 我的`
- 首页承载：学习入口 + 转化入口 + 运营/商业位（banner/推荐/套餐）


## 合并请求：01-miniapp MVP 答题闭环
- 发起模块：modules/01-miniapp
- 目标模块：main
- 分支：`feat/01-miniapp-mvp-exam-winE3`
- 原因：01-miniapp 窗口仅修改自身模块目录，需 99-hub 代为发起/跟进 MR。
- 验收方式（建议）：
  - git fetch origin && git checkout feat/01-miniapp-mvp-exam-winE3
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

--- 2026-01-21 14:43 ---
