# 02-backend-core API 约定（草案）

目的：统一联调行为与接口输出格式；最终以 99-hub 定稿为准。

## 1. Base URL

- 本地默认：`http://localhost:3000`
- 可通过环境变量 `PORT` 修改

## 2. 鉴权

- 需要鉴权的接口：要求 `Authorization: Bearer <token>`
- Mock 登录：`POST /auth/wechat` 返回 `demo-token`

## 3. RequestId

- 服务端为每个请求生成 `X-Request-Id`
- 错误响应体包含同一个 `requestId`

## 4. 错误响应格式

```json
{ "code": "INVALID_ARGUMENT", "message": "Missing planId", "requestId": "req-..." }
```

常用 code：

- `UNAUTHORIZED` / `FORBIDDEN`
- `INVALID_ARGUMENT`
- `NOT_FOUND`
- `INTERNAL`

## 5. CORS

- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Methods: GET,POST,DELETE,OPTIONS`
- 浏览器可读取 `X-Request-Id`：通过 `Access-Control-Expose-Headers` 暴露（若对应实现分支已合入）

## 6. Content-Type

- 请求：`Content-Type: application/json`
- 响应：`application/json; charset=utf-8`

