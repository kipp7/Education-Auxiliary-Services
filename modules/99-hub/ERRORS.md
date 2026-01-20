# 错误码与返回结构（草案）

## 1) 统一返回结构（建议）

成功：

```json
{ "data": { }, "meta": { "requestId": "..." } }
```

失败：

```json
{
  "error": {
    "code": "AUTH_INVALID_TOKEN",
    "message": "Token 无效或已过期",
    "details": null
  },
  "meta": { "requestId": "..." }
}
```

## 2) 错误码命名规则

- 格式：`<DOMAIN>_<REASON>`（全大写，下划线分隔）
- 示例：`AUTH_INVALID_TOKEN`、`QUIZ_NOT_FOUND`、`IMPORT_PARSE_FAILED`

## 3) Domain（建议最小集）

- `AUTH_*`：鉴权/登录
- `BIZ_*`：通用业务校验（参数缺失、状态不允许等）
- `QUIZ_*`：题库/题目
- `ANSWER_*`：作答/提交
- `IMPORT_*`：导入任务
- `SYS_*`：系统错误（依赖不可用、未知异常）

## 4) HTTP 状态码映射（建议）

- 400：参数/业务校验失败（`BIZ_*`）
- 401：未登录/Token 无效（`AUTH_*`）
- 403：无权限
- 404：资源不存在
- 409：冲突（重复提交/状态冲突）
- 429：限流
- 500：未知异常（`SYS_*`）
- 503：依赖不可用（`SYS_*`）
