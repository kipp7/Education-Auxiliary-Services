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


## M1/M2 对齐清单（待各模块确认）
- 发起模块：modules/99-hub
- 目标模块：modules/01-miniapp / modules/02-backend-core / modules/03-importer
- 原因：推进 M1（小程序 Mock 最小闭环）与 M2（API 契约定稿），需要先冻结“契约形式/错误码/数据结构/鉴权/导入任务模型”。
- 验收方式（对齐完成的判定）：
  - 99-hub：在仓库约定位置产出 OpenAPI 3.1 骨架文件（或 OpenSpec 变更）并通过工具校验（如有）。
  - 02-backend-core：按契约实现最小路由返回 mock/真实数据；错误码与鉴权中间件一致。
  - 01-miniapp：可在 mock/真实 API 间切换，全路径页面不报错。

### 1) 契约单一来源
- [ ] 选择 OpenAPI 版本：建议 OpenAPI 3.1（JSON Schema 原生兼容）
- [ ] 契约存放路径：建议仓库独立目录（例如 contracts/openapi/），避免分散到模块内
- [ ] 发布/消费：
  - [ ] miniapp mock：从 OpenAPI 生成/对齐 mock schema（或至少按同一模型手写 mock）
  - [ ] backend：路由实现与响应校验（可选）对齐 OpenAPI

### 2) 统一返回包裹（response envelope）
- [ ] 成功：{ data, meta? }
- [ ] 失败：{ error: { code, message, details? }, meta? }
- [ ] meta.requestId：建议后端生成并回传，便于联调定位

### 3) 错误码规范
- [ ] 命名：<DOMAIN>_<REASON>（全大写，下划线）
- [ ] 最小 domain：AUTH_* / BIZ_* / QUIZ_* / ANSWER_* / IMPORT_* / SYS_*
- [ ] HTTP 状态码映射：400/401/403/404/409/429/500/503（先定规则再扩展）

### 4) 鉴权方式与刷新
- [ ] Header：Authorization: Bearer <accessToken>
- [ ] 登录：POST /auth/wechat（code → access/refresh）
- [ ] 刷新：POST /auth/refresh
- [ ] 登出：POST /auth/logout（可选 MVP）

### 5) 题目通用数据结构（Question）
- [ ] 最小字段：id, 	ype, stem, options[], nswer, nalysis, ssets[], 	ags[]?
- [ ] 题型枚举：单选/多选/判断/填空/简答（先定最小集合）
- [ ] 素材：图片/音频/富文本的承载方式（URL vs 内嵌）
- [ ] 兼容导入：IR（Importer）→ Question（API）字段映射表

### 6) 作答/进度最小接口（供 M1 闭环）
- [ ] GET /subjects
- [ ] GET /packages?subjectId=...
- [ ] GET /chapters?packageId=...
- [ ] GET /questions?chapterId=...&mode=...&limit=...
- [ ] POST /answers/submit
- [ ] GET /progress?packageId=...

### 7) 导入任务模型（ImportTask）
- [ ] 状态机：queued|running|succeeded|failed|canceled?
- [ ] 进度：统一精度（0~100）
- [ ] 错误报告：落地方式（DB/对象存储）与大小上限
- [ ] 权限：createdBy 与谁可查看/取消

--- 2026-01-21 01:10 ---
