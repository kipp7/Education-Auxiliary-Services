# 02-backend-core 任务看板

> 目标：提供稳定的“用户/权限/题库/作答/统计”API，供小程序与后台共用。

## 0.1 本模块负责范围（关键词）
- `auth`, `svip`, `entitlements`, `question-bank`, `course`, `order`, `admin-api`

## 0. 约束
- [ ] 仅修改 `modules/02-backend-core/**` 内文件
- [ ] 接口契约先在 `modules/99-hub` 定稿，再实现

## 1. MVP：接口契约与最小服务
- [ ] 与 99-hub 一起确定 API 契约（建议 OpenAPI/JSON Schema）
- [ ] 认证：`POST /auth/wechat`（code→session/token），定义 token 传递方式
- [ ] 题库读取：
  - [ ] `GET /subjects`
  - [ ] `GET /packages?subjectId=...`
  - [ ] `GET /chapters?packageId=...`
  - [ ] `GET /questions?chapterId=...&mode=...&limit=...`
- [ ] 作答提交：`POST /answers/submit`
- [ ] 进度统计：`GET /progress?packageId=...`
- [ ] 错题/收藏：
  - [ ] `GET /wrongs`
  - [ ] `POST /favorites` / `DELETE /favorites`

## 2. 权限（VIP/激活码）
- [ ] 数据模型：激活码、权益（科目/题库包）
- [ ] `POST /activation/redeem`
- [ ] `GET /me/entitlements`
- [ ] 题库访问控制（未开通返回明确错误码）

## 2.1 需求补充（来自《需求规格说明书》）
- [ ] SVIP 码：每码仅可绑定 1 个账号；可配置有效期；支持注销/回收
- [ ] 付费用户：套餐、有效期、权限范围（后置，但要预留模型/接口）
- [ ] 非会员：仅可浏览分类标题/简介，不可观看视频/不可做题（需要统一错误码）

## 3. 管理能力（给 04-admin-console 或第三方后台用）
- [ ] 题库包/章节/题目 CRUD（基础版本）
- [ ] 导入任务查询（与 03-importer 对接）

## 3.1 课程资源（新增）
- [ ] `GET /videos`（按学段/年级/科目/单元筛选）
- [ ] `POST /videos/progress`（上报观看进度）
- [ ] `GET /me/learning-records`（视频+做题记录汇总）

## 4. 运维与安全
- [ ] 统一错误码与日志结构（与 99-hub 对齐）
- [ ] 环境变量与配置模板（同步到 `ENVIRONMENT.md`）
- [ ] 基础限流/防刷策略（后续）

