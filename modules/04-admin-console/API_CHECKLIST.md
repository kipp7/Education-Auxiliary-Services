# 管理台 MVP 接口清单（草案）

> 说明：本清单用于对齐“管理台需要哪些接口”。最终以 `modules/99-hub/` 定稿的契约为准。

## 鉴权

- `POST /admin/auth/login`：管理员登录（账号体系由 99-hub 定稿）
- `GET /admin/auth/me`：当前登录信息（角色/权限点）

## 题库管理（最小闭环）

- `GET /admin/subjects`
- `POST /admin/subjects`
- `PATCH /admin/subjects/:id`
- `DELETE /admin/subjects/:id`

- `GET /admin/packages?subjectId=...`
- `POST /admin/packages`
- `PATCH /admin/packages/:id`
- `DELETE /admin/packages/:id`

- `GET /admin/chapters?packageId=...`
- `POST /admin/chapters`
- `PATCH /admin/chapters/:id`
- `DELETE /admin/chapters/:id`

- `GET /admin/questions?chapterId=...&q=...&page=...&pageSize=...`
- `POST /admin/questions`
- `PATCH /admin/questions/:id`
- `DELETE /admin/questions/:id`

## 导入管理

- `POST /admin/imports/upload`：上传文件/开始导入（实现方式由 03-importer/02-backend-core 定稿）
- `GET /admin/imports?page=...&pageSize=...`：导入任务列表
- `GET /admin/imports/:taskId`：导入任务详情（状态/进度/错误摘要）
- `GET /admin/imports/:taskId/errors`：错误明细（分页）
- `GET /admin/imports/:taskId/errors/export`：错误报告下载

