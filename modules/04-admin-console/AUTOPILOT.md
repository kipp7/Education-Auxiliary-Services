# 04-admin-console AUTOPILOT

> 目的：把本模块按里程碑拆成可连续交付的小步；每完成一个里程碑：
> 1) commit + push
> 2) 追加验收路径到 `modules/04-admin-console/CONVERSATION_LOG.txt`
>
> 约束：本模块实现以 99-hub 的 UI/权限/接口契约为准；在契约未冻结前允许占位（本地示例数据 / dev 登录）。

## M1：管理台 Web 骨架 + 登录与权限守卫

- 产出：
  - `modules/04-admin-console/web/`：Vite + React + TS 最小可运行
  - `/login`：开发占位登录
  - `/`：RequireAuth 保护的首页
- 验收路径：
  - `cd modules/04-admin-console/web`
  - `npm install`
  - `npm run dev`
  - 打开 `http://localhost:5174`，点击“开发登录”进入首页；退出后回到登录页

## M2：题库管理（最小骨架）

- 产出：`/question-bank` 页面（科目/题库包/章节/题目列表，占位 CRUD）
- 验收路径：
  - 登录后进入“题库管理”
  - 可新增/重命名/删除：科目、题库包、章节、题目

## M3：导入管理（最小骨架）

- 产出：`/imports` 与 `/imports/:taskId`（上传占位、任务列表、详情、错误报告下载占位）
- 验收路径：
  - 登录后进入“导入管理”
  - 点击“上传（占位）”创建任务，进入详情页，可下载错误 CSV（占位）

## M4：资讯/公告管理（最小骨架）

- 产出：`/cms`（公告新增/编辑/删除、草稿/发布切换、搜索，占位数据）
- 验收路径：
  - 登录后进入“公告管理”
  - 可新增公告、编辑、发布/下线、搜索、删除

