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


## 对齐导入任务模型（ImportTask）
- 发起模块：modules/03-importer
- 目标模块：modules/99-hub（汇总）/ modules/02-backend-core
- 原因：03-importer 已起草导入任务状态/字段，用于后续 GET /import/status 契约与落库实现
- 期望改动：
  - 由总控确认 ImportTask 字段与状态机口径（progress 精度、stage 列表、错误报告落地方式、createdBy 权限等）
  - 需要时在 OpenSpec/接口契约中落地统一版本
- 影响评估：涉及后端接口返回结构与任务表设计；若不统一，后续联调会频繁返工

## 对齐导入上传接口（/import/upload, /import/status）
- 发起模块：modules/03-importer
- 目标模块：modules/99-hub（汇总）/ modules/02-backend-core
- 原因：03-importer 已输出上传/状态接口草案（见 modules/03-importer/UPLOAD_API_DRAFT.md），需要统一鉴权、存储与返回结构
- 期望改动：
  - 确认上传方式：直传到服务端 vs 直传对象存储 + 服务端引用
  - 确认大小限制（zip/多文件）、错误码与限流策略
  - 确认 /import/status 返回字段与 ImportTask 一致（progress/stage/result/errors）
- 影响评估：影响前端导入交互与后端实现边界；不对齐会导致接口反复调整

## 对齐目录层级解析规则（分类树）
- 发起模块：modules/03-importer
- 目标模块：modules/99-hub（汇总）/ modules/02-backend-core
- 原因：03-importer 已输出目录层级解析草案（见 modules/03-importer/FOLDER_HIERARCHY_RULES_DRAFT.md），需要统一分类树的落库结构与幂等策略
- 期望改动：
  - 确认分类节点字段：仅存 path vs 需要 	ype（科目/年级/章节）
  - 确认“根目录折叠”启用条件与前端提示
  - 确认是否需要默认分类（未分类）
- 影响评估：影响导入归类、后续查询筛选与幂等；不对齐会导致入库结构返工
