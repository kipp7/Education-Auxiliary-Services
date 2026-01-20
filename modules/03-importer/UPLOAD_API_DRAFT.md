# Import Upload / Status API（草案）

> 说明：此文档仅定义 03-importer 侧的接口“建议形态”，用于与 `99-hub`/`02-backend-core` 对齐契约；最终以总控 OpenSpec/接口规范为准。

## 1. `POST /import/upload`

发起一次导入任务（上传 zip 或多文件），返回任务ID，用于后续查询状态。

### 1.1 请求

**Content-Type**（二选一）：

- `multipart/form-data`：推荐，便于直接上传文件
- `application/json`：仅用于“引用已上传文件”的场景（依赖对象存储，待 99-hub 定）

#### 方案A：multipart（推荐）

字段建议：

- `files`：文件数组（支持多文件；zip 也走此字段）
- `mode`：`zip` | `multi-file`（可选；也可由服务端根据文件类型推断）
- `options`：JSON 字符串（可选），例如：
  - `dryRun`: `true|false`（仅解析不入库，便于预览/抽检）
  - `rootFolderName`: string（可选，用于生成目录树根节点）

#### 方案B：JSON（引用已上传资源）

```json
{
  "input": {
    "type": "zip",
    "objectKey": "imports/2026-01-20/xxx.zip",
    "originalName": "题库.zip"
  },
  "options": {
    "dryRun": true
  }
}
```

### 1.2 响应

成功（`200` 或 `202`）：

```json
{
  "id": "uuid",
  "status": "queued"
}
```

失败（示例）：

- `400`：参数错误/不支持的文件类型
- `413`：文件过大
- `415`：Content-Type 不支持

## 2. `GET /import/status?id=...`

查询导入任务状态与进度，供管理端/导入页面轮询展示。

### 2.1 请求

Query：

- `id`：任务ID（必填）

### 2.2 响应

成功（`200`）：

```json
{
  "id": "uuid",
  "status": "running",
  "stage": "parsing",
  "progress": 32,
  "result": {
    "parsedCount": 120,
    "importedCount": 0,
    "skippedCount": 0,
    "errorCount": 3
  },
  "errors": [
    { "file": "数学/一年级/单选.txt", "code": "PARSE_ERROR", "message": "第 17 行：无法识别题干边界" }
  ],
  "createdAt": "2026-01-20T12:30:00.000Z",
  "updatedAt": "2026-01-20T12:31:10.000Z"
}
```

未找到（`404`）：

```json
{ "error": "NOT_FOUND" }
```

## 3. 错误报告与预览（后续扩展）

> 先留接口位，不在本草案中定最终形态。

- `GET /import/report?id=...`：下载错误报告（CSV/JSON）
- `GET /import/preview?id=...&limit=...`：预览前 N 道题（用于抽检）

## 4. 待对齐问题（写入 99-hub）

- 上传文件大小上限与存储方式（直传/转存对象存储）
- 鉴权/权限：谁可上传、谁可查看任务、是否支持取消
- 幂等策略：重复上传同一份资源是否复用任务
- `progress` 精度与 `stage` 枚举
