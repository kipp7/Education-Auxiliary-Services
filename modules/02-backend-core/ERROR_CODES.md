# 02-backend-core 错误码（草案）

目的：统一前后端联调时的错误语义。最终以 99-hub 定稿为准。

## 响应格式

所有错误响应为：

```json
{
  "code": "INVALID_ARGUMENT",
  "message": "Missing planId",
  "requestId": "req-..."
}
```

其中 `requestId` 同时会出现在响应头 `X-Request-Id`。

## 错误码枚举（当前实现已使用）

- `UNAUTHORIZED`：未登录/缺少或无效的 `Authorization: Bearer <token>`
- `FORBIDDEN`：已登录但无权限（预留，后续用于权益控制）
- `INVALID_ARGUMENT`：参数错误/非法 JSON
- `NOT_FOUND`：资源不存在/路由不存在
- `INTERNAL`：服务端异常

## 常见场景

- 缺少 query 参数：`400 INVALID_ARGUMENT`
- 缺少 body 字段：`400 INVALID_ARGUMENT`
- 非法 JSON：`400 INVALID_ARGUMENT` + `message=Invalid JSON`
- 未带 Authorization：`401 UNAUTHORIZED`
- 查询不存在的订单：`404 NOT_FOUND`

