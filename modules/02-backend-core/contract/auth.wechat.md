# `POST /auth/wechat`（Draft）

目标：把微信登录 `code` 映射到本系统用户，并签发可用于后续 API 的访问 token。

## Request

`Content-Type: application/json`

```json
{ "code": "wx.login 返回的 code" }
```

## Response（Draft）

```json
{
  "token": "string",
  "expiresIn": 7200,
  "userId": "string",
  "isNewUser": false
}
```

## Token 传递方式（Draft）

后续需要鉴权的接口使用 HTTP Header：

`Authorization: Bearer <token>`

## 错误（Draft）

- `400`：`code` 缺失/无效
- `401`：token 无效/过期（用于受保护接口）

