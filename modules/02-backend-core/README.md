# 02-backend-core

后端核心模块：提供“用户/权限/题库/作答/统计”相关 API。

## 负责范围

- 后端 API：用户、权限、题库、题目、作答、统计、错题/收藏
- 认证/授权：微信登录态映射、token/session 方案

## 关键词（按 KEYWORDS.md）

`api`, `auth`, `user`, `entitlements`, `activation`, `question`, `category`, `package`, `chapter`, `record`, `answer`, `progress`

## 约束（按 TASKS.md）

- 仅修改 `modules/02-backend-core/**`
- 接口契约先在 `modules/99-hub` 定稿，再实现
