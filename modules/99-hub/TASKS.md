# 99-hub（总控/集成）任务看板

> 目标：把多模块工作“对齐接口契约 + 管控冲突 + 联调验收”。

## 0.1 总控关键词
- `contract`, `openapi`, `schema`, `integration`, `release`, `workflow`, `conflict`

## 1. 里程碑
- [ ] M0：仓库模块化与协作规则落地（已完成）
- [ ] M1：小程序 Mock 跑通最小闭环（01-miniapp）
- [ ] M2：API 契约定稿（Auth/题库/作答/错题/收藏/权益）
- [ ] M3：后端最小服务可用（02-backend-core）
- [ ] M4：导入任务 MVP 可用（03-importer）
- [ ] M5：小程序切换真实 API 并联调通过
- [ ] M6：验收清单与发布流程

## 2. 接口契约（OpenSpec / OpenAPI）
- [ ] 选择契约形式（OpenAPI 3.0/3.1 或 JSON Schema + 文档）
- [ ] 定义错误码规范与返回结构
- [ ] 定义鉴权方式（token/session）与刷新策略
- [ ] 定义“题目通用数据结构”（题型、选项、答案、解析、素材）

### 2.1 首页/商业内容（新增）
> Tab 结构确认：`首页 / 题库 / 资讯 / 我的`。首页需要接入运营与商业内容。
- [ ] Banner 配置：`GET /content/banners`（图片、跳转类型、目标）
- [ ] 资讯：`GET /content/news`、`GET /content/news/:id`
- [ ] 推荐：`GET /content/recommendations`（题库/课程/套餐）
- [ ] 商品/套餐：`GET /billing/plans`、`POST /billing/order`
- [ ] Paywall 文案：`GET /content/paywall-copy`（后置但需预留）

## 3. 联调与验收
- [ ] 联调 checklist（逐条接口、逐条页面）
- [ ] 测试数据准备与回归脚本（最小集合）
- [ ] 版本发布说明模板（Release Notes）

## 4. 冲突治理
- [ ] 检查各窗口是否只修改本模块目录
- [ ] 处理 `modules/99-hub/REQUESTS.md` 队列并合并到 `main`

## 5. 本次需求（《需求规格说明书》）拆解
### 5.1 三大主页面
- [ ] 题库：轮播 + 年级段（初中/单招）+ 分类树 + 练习/做题入口
- [ ] 课程：与题库同结构筛选 + 视频播放续播 + 学习进度
- [ ] 我的：SVIP 码绑定 + 付费入口 + 学习记录 + 账号设置 + 反馈

### 5.2 权限策略（先定契约，后实现）
- [ ] SVIP：机构学生，绑定后解锁全部
- [ ] 付费会员：解锁套餐范围内容（后置）
- [ ] 非会员：可浏览分类但不可查看详情/不可做题/不可看视频

## 6. 并行开发派单清单（你开多窗口就照这个分）
- [ ] 01-miniapp：题库/课程/我的 三页 + 路由/tabBar + 权限拦截
- [ ] 02-backend-core：Auth + SVIP + 题库/题目 + 视频/进度 + 学习记录
- [ ] 03-importer：文件夹/zip 导入任务 + 题目 IR + txt parser（先跑通）
- [ ] 04-admin-console：轮播/试题/视频/SVIP/订单（后置，先出骨架）

