# 管理台 MVP 路由与权限（草案）

> 注意：本文件仅用于梳理页面与最小权限点；最终以 `modules/99-hub/` 定稿的 RBAC/接口契约为准。

## 路由（建议）

- `/login`：管理员登录
- `/dashboard`：概览（可后置）
- `/question-bank`：题库管理入口（科目/题库包/章节/题目列表）
- `/imports`：导入任务列表
- `/imports/:taskId`：导入任务详情（含错误报告下载）
- `/users`：管理员与角色（可后置）
- `/cms`：内容管理（资讯/公告，可后置）

## 最小权限点（示例）

> 权限命名建议按 `resource:action`；下面仅示例，等待 99-hub 冻结后再替换为最终值。

- `admin:access`：允许进入管理台
- `question-bank:read` / `question-bank:write`
- `import:read` / `import:write`
- `user:read` / `user:write`
- `cms:read` / `cms:write`

