# 02-backend-core 接口清单（Mock / 草案）

目的：给前端/小程序联调一个快速参考入口；最终以 OpenAPI 为准：`modules/02-backend-core/contract/mvp.openapi.yaml`。

## 公共

- `GET /health`：健康检查（无需鉴权）
- `POST /auth/wechat`：登录换 token（无需鉴权）

## 需要鉴权（Authorization: Bearer <token>）

### 题库

- `GET /subjects`
- `GET /packages?subjectId=...`
- `GET /chapters?packageId=...`
- `GET /questions?chapterId=...&limit=...`
- `POST /answers/submit`
- `GET /progress?packageId=...`
- `GET /wrongs`
- `GET /favorites`
- `POST /favorites`
- `DELETE /favorites?questionId=...`

### 内容/资讯

- `GET /content/banners`
- `GET /content/news`
- `GET /content/news/:id`
- `GET /content/recommendations`

### 商业化

- `GET /billing/plans`
- `POST /billing/order`
- `GET /billing/order/:orderId`

### 我的

- `GET /me/entitlements`
- `GET /me/learning-records`

## 回调（通常无需鉴权）

- `POST /billing/payment/callback`

