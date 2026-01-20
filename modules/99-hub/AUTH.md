# 鉴权与刷新策略（草案）

## 1) 目标

- 小程序端以最小成本完成“登录 → 携带身份 → 刷新/失效处理”闭环
- 后端可统一鉴权中间件，避免每个接口重复处理

## 2) 推荐方案（MVP）

- 传输：HTTP Header
- Access Token：短期有效（例如 2h）
- Refresh Token：长期有效（例如 14d），仅用于刷新 access token

### 2.1 Header 约定

- `Authorization: Bearer <access_token>`

## 3) 登录（微信）

`POST /auth/wechat`

- 请求：`{ code: string }`
- 响应（建议）：
  - `data.accessToken`
  - `data.refreshToken`
  - `data.expiresIn`（秒）
  - `data.user`（最小用户信息）

## 4) 刷新

`POST /auth/refresh`

- 请求（建议）：`{ refreshToken: string }`
- 响应：同登录（新 access/refresh 可按轮换策略决定）

## 5) 失效与登出

- access token 过期：返回 `401 AUTH_INVALID_TOKEN`
- refresh token 失效/撤销：刷新接口返回 `401 AUTH_INVALID_REFRESH_TOKEN`，客户端回到登录
- 登出：`POST /auth/logout`（可选 MVP）

## 6) 权限（占位）

- MVP 仅区分“登录/未登录”
- 后续扩展：按用户角色/权益做 `403 AUTH_FORBIDDEN`
