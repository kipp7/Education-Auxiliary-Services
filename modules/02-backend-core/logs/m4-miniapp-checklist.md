# M4 联动验收记录（02-backend-core）

目的：在不依赖 MCP 的情况下，给总控/测试一份可执行的联动验收 checklist，并把结果记录在本文件（避免口头对齐丢失）。

## 0. 前置

- 本地已安装 Node.js（含 npm）
- 当前后端分支：`feat/02-backend-core-autopilot-codex`

## 1. 启动后端（本模块）

```bash
cd modules/02-backend-core
npm run dev
```

确认：

```bash
curl http://localhost:3000/health
```

预期：返回 `{"ok":true}`。

## 2. 小程序侧联动（手工）

说明：小程序侧“关闭 mock、改为真实 API”的开关由 miniapp 模块负责；此处只给验收步骤与记录位。

建议记录字段：
- miniapp 当前分支 / 版本：
- 小程序配置（API baseURL / USE_MOCK）：

### 2.1 题库树联动

步骤：
1) 打开小程序 → 题库页
2) 触发加载科目/题库包/章节

预期：
- 请求 `GET /subjects`、`GET /packages`、`GET /chapters` 成功

记录：
- 实际请求路径：
- 结果（OK/Fail）：
- 失败错误码/响应（如有）：

### 2.2 题目联动

步骤：
1) 进入某章节
2) 加载题目列表

预期：
- 请求 `GET /questions?chapterId=...` 成功

记录：
- 结果（OK/Fail）：
- 失败错误码/响应（如有）：

### 2.3 提交作答联动

预期：
- 请求 `POST /answers/submit` 成功（mock 返回 `{"submitted":...}`）

记录：
- 结果（OK/Fail）：
- 失败错误码/响应（如有）：

### 2.4 学习记录/权益/运营位联动（按需）

涉及接口：
- `GET /me/learning-records`
- `POST /activation/redeem`
- `GET /me/entitlements`
- `GET /content/banners` / `GET /content/news` / `GET /content/news/:id`
- `GET /content/recommendations`
- `GET /billing/plans`

记录：
- 逐接口结果与错误码：

