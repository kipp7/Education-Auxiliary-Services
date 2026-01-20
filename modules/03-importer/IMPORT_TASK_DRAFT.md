# Import Task Model（草案）

> 说明：此文档是 `03-importer` 模块的“导入任务模型”草案，用于和 `99-hub` / `02-backend-core` 对齐口径；最终以总控的 OpenSpec / 契约为准。

## 目标

- 让“上传 → 解析 → 入库”的异步流程可追踪、可回滚、可审计
- 为后续 `GET /import/status?id=...` 等接口提供稳定返回结构
- 为错误报告与产出统计提供统一载体

## 核心字段（建议）

- `id`：任务ID（建议 UUIDv4）
- `status`：任务状态（见下方状态机）
- `progress`：进度（0~100 或 0~1；建议统一为 0~100）
- `stage`：当前阶段（可选，用于更细粒度的 UI 展示与日志归档）
- `createdAt` / `updatedAt`：时间戳（ISO8601）
- `createdBy`：发起人标识（可选；具体与认证方案对齐）
- `input`：输入资源描述
  - `type`：`zip` | `folder` | `multi-file`（建议）
  - `files`：文件清单（原始文件名、相对路径、大小、hash 可选）
- `result`：产出统计（成功/失败/跳过数量等）
- `errors`：错误摘要（列表，适合快速展示；详细报告走 `errorReport`）
- `errorReport`：错误报告位置（URL/对象存储 key/或 DB 引用）

## 状态机（建议）

最小集（足够支撑 MVP）：

- `queued`：已创建，等待处理
- `running`：处理中（阶段由 `stage` 表示）
- `succeeded`：完成
- `failed`：失败（需要错误报告）
- `canceled`：取消（可选）

推荐扩展（便于排障与埋点）：

- `uploading`：上传中
- `parsing`：解析中
- `validating`：校验中（题型/答案/目录结构等）
- `importing`：入库中

## 示例（JSON）

```json
{
  "id": "0b3b5b2d-9f2a-4f18-8f90-7b0dbe4b2d8a",
  "status": "running",
  "stage": "parsing",
  "progress": 32,
  "createdAt": "2026-01-20T12:30:00.000Z",
  "updatedAt": "2026-01-20T12:31:10.000Z",
  "input": {
    "type": "zip",
    "files": [
      { "path": "数学/一年级/单选.txt", "size": 10240 }
    ]
  },
  "result": {
    "parsedCount": 120,
    "importedCount": 0,
    "skippedCount": 0,
    "errorCount": 3
  },
  "errors": [
    { "file": "数学/一年级/单选.txt", "code": "PARSE_ERROR", "message": "第 17 行：无法识别题干边界" }
  ],
  "errorReport": null
}
```

## 待对齐问题（由 99-hub 汇总）

- `progress` 精度：0~100 还是 0~1
- 错误报告落地方式：DB / 文件 / 对象存储；以及最大体积约束
- `createdBy` 与权限：谁可以查看/取消任务
- 任务幂等：重复导入同一份资源的判定依据（hash？文件路径？）
