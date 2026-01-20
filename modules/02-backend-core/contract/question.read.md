# 题库读取接口（Draft）

说明：以下为草案，最终以 99-hub 定稿契约为准。

## `GET /subjects`

返回科目列表。

响应（Draft）：

```json
[
  { "id": "string", "name": "string" }
]
```

## `GET /packages?subjectId=...`

参数：
- `subjectId`：科目 ID（必填）

响应（Draft）：

```json
[
  { "id": "string", "subjectId": "string", "name": "string" }
]
```

## `GET /chapters?packageId=...`

参数：
- `packageId`：题库包 ID（必填）

响应（Draft）：

```json
[
  { "id": "string", "packageId": "string", "name": "string" }
]
```

## `GET /questions?chapterId=...&mode=...&limit=...`

参数：
- `chapterId`：章节 ID（必填）
- `mode`：练习/考试等模式（可选，需 99-hub 定稿枚举）
- `limit`：返回题目数量（可选，建议 1~200）

响应（Draft）：

```json
[
  { "id": "string", "chapterId": "string", "stem": "string", "analysis": "string" }
]
```

