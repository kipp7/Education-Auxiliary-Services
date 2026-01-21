# 03-importer 任务看板

> 目标：实现“拖拽文件夹/zip → 解析 → 题目入库”的可扩展导入流水线。

## 0.1 本模块负责范围（关键词）
- `import`, `folder-drop`, `zip`, `parser`, `ir`, `report`

## 0. 约束
- [ ] 仅修改 `modules/03-importer/**` 内文件
- [ ] 与 02-backend-core 的落库/数据模型对齐（由 99-hub 汇总）

## 1. MVP：导入任务流水线（不绑定具体格式）
- [x] 导入任务模型：任务ID、状态、进度、错误报告、产出统计（见 `modules/03-importer/ir/import-task.schema.json`）
- [x] 上传入口（建议）（草案见 `modules/03-importer/api/import.openapi.yaml`）
  - [x] `POST /import/upload`（zip 或多文件）
  - [x] `GET /import/status?id=...`
- [x] 目录层级解析：把 folder path 解析为分类树节点（实现见 `modules/03-importer/tools/parse-hierarchy.mjs`，样例见 `modules/03-importer/samples/hierarchy/file-list.txt`，输出见 `modules/03-importer/output/hierarchy.json`）
- [x] 题目解析接口：先定义输入/输出中间格式（IR），再实现具体 parser（见 modules/03-importer/ir/question-ir.schema.json）

## 2. Parser 插件化（按优先级）
- [x] `txt` 模板解析（最快落地；实现见 `modules/03-importer/tools/parse-txt.mjs`，样例见 `modules/03-importer/samples/txt/basic.txt`）
- [x] `doc/docx` 解析（最小实现：提取 document.xml 文本后复用 txt parser；工具见 `modules/03-importer/tools/parse-docx.ps1`；样例见 `modules/03-importer/samples/docx/basic.docx`；输出见 `modules/03-importer/output/basic.docx.parsed.json`）
- [ ] `pdf` 解析（按样例再定）
- [ ] 图片 OCR（最后做；先支持人工校对流程）

## 2.1 需求补充（来自《需求规格说明书》）
- [ ] 题型覆盖：选择题（单选/多选）、判断题、填空题、论述题/大题
- [ ] 解析字段：题干、选项、答案、解析、分值、难度、题型、归属（学段/年级/科目/单元）
- [ ] “同步试题(预览)”与“在线做题(作答)”共用一套题目数据结构（由 99-hub 定义 IR）

## 3. 质量与可回滚
- [ ] 幂等：重复导入同一份资源不会造成脏数据（策略由 99-hub 定）
- [x] 错误报告：行号/文件名/原因/建议修复（格式见 modules/03-importer/ir/error-report.schema.json）
- [ ] 预览/抽检：导入后可预览前 N 道题




