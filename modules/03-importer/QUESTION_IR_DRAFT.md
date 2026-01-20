# 题目解析 IR（Intermediate Representation）草案 v0

> 目标：将不同来源（txt/docx/pdf/ocr）的题目内容统一到一个中间结构（IR），再由入库层将 IR 映射到后端数据模型。
>
> 说明：此文档为 03-importer 的建议口径，最终以 99-hub 汇总/契约为准。

## 1. 设计原则

- **格式无关**：解析器只负责产出 IR，不直接依赖落库表结构
- **可追溯**：每道题可追溯到源文件/行号/页码/图片区域
- **可扩展**：先覆盖单选/多选/判断，后续再扩展填空/简答/材料题

## 2. 顶层结构

一份导入结果建议是“按文件产生题目列表”，并包含错误报告：

```json
{
  "file": {
    "path": "数学/一年级/单元1/单选.txt",
    "sha1": "..."
  },
  "categoryPath": "数学/一年级/单元1",
  "questions": [ /* QuestionIR[] */ ],
  "errors": [ /* ParseError[] */ ]
}
```

## 3. QuestionIR

### 3.1 必备字段（v0）

```json
{
  "id": "q-0001",
  "type": "single",
  "stem": "2+2= ?",
  "options": [
    { "key": "A", "text": "3" },
    { "key": "B", "text": "4" }
  ],
  "answer": {
    "value": "B"
  },
  "analysis": "2+2=4",
  "source": {
    "filePath": "数学/一年级/单元1/单选.txt",
    "lineStart": 12,
    "lineEnd": 18
  }
}
```

字段说明：

- `id`：解析阶段可用“文件内递增编号”，入库时由后端生成正式 ID
- `type`：题型枚举（见下）
- `stem`：题干（纯文本或轻量富文本；富文本规范待对齐）
- `options`：选项列表（单选/多选必填；判断题可省略）
- `answer`：答案（按题型不同结构不同；v0 统一放 `value`）
- `analysis`：解析（可空）
- `source`：溯源信息（至少包含文件路径；txt 以行号，pdf/doc 以页/段落等）

### 3.2 题型枚举（v0）

- `single`：单选
- `multi`：多选
- `judge`：判断

> 后续扩展候选：`blank`（填空）、`short`（简答）、`material`（材料/阅读）等。

### 3.3 Option

```json
{ "key": "A", "text": "选项内容" }
```

- `key`：建议使用 `A|B|C|D...`
- `text`：选项文本（可包含图片占位符，待 99-hub 定）

### 3.4 Answer（v0 简化）

v0 先统一用 `value`：

- `single`：`"A"`
- `multi`：`"AC"` 或 `"A,C"`（建议统一为数组，见 v1）
- `judge`：`"true"|"false"`（或 `"T"|"F"`，需统一）

建议 v1 改为结构化：

```json
{ "values": ["A", "C"] }
```

## 4. 富文本与附件（预留）

为 OCR / docx / pdf 解析预留：

- `contentBlocks`: 题干/解析按块拆分（text/image/formula）
- `assets`: 图片/附件列表（本地路径或对象存储 key）

> v0 暂不强制启用，先用纯文本 + 占位符满足 txt 模板。

## 5. ParseError

```json
{
  "code": "PARSE_ERROR",
  "message": "无法识别题干边界",
  "filePath": "数学/一年级/单元1/单选.txt",
  "line": 17
}
```

## 6. 待对齐问题（写入 99-hub）

- `type` 枚举与后端题型字段映射
- `answer` 规范（多选/判断的表示方式）
- 富文本规范（是否允许 Markdown/HTML/自定义 blocks）
- 图片/公式的表示与存储（占位符/对象存储/引用方式）
- 溯源字段：docx/pdf 的页码/段落/坐标如何统一
