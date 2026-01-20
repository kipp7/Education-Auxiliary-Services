# 02-backend-core 挂机执行指南（窗口一次性跑完）

目标：先把“接口契约 + 最小服务骨架”跑通，供小程序联调。

## 0. 约束
- 只改 `modules/02-backend-core/**`
- 先写契约，再写实现；跨模块对齐写到 `modules/99-hub/REQUESTS.md`

## 1. 开工指令（一次）
```bash
git fetch --all
git checkout main
git pull --rebase origin main
git checkout -b feat/02-backend-core-mvp
```

## 2. 挂机里程碑

### M1：契约定稿草案（OpenAPI）
- 输出：`modules/02-backend-core/contract/mvp.openapi.yaml`
- 覆盖：`/auth/wechat`、题库树、题目、视频列表/进度、SVIP 绑定、学习记录、统一错误码

### M2：最小服务骨架（不要求落库）
- 输出：项目结构/路由骨架/鉴权中间件占位
- 先返回 mock 数据，保证小程序可跑通

## 3. 输出与汇报
每完成一个里程碑才提交/推送，并在 `modules/02-backend-core/CONVERSATION_LOG.txt` 记录验收方式（curl 示例）。

## 4. 联动验收（建议，若 MCP 可用）
如果你当前窗口能连上微信小程序 MCP：
- 在小程序侧用 `mp_getLogs` 检查 API 失败日志（例如 401/403/5xx）
- 把关键错误码与请求路径整理到 `modules/99-hub/REQUESTS.md`，让契约与实现一致
