# 02-backend-core 环境变量

本模块当前为 Mock API（`node src/server.js`），用于小程序/前端联调。

## 必需

- `PORT`
  - 说明：HTTP 服务监听端口
  - 默认：`3000`
  - 示例：`set PORT=3000`（Windows CMD）/ `$env:PORT="3000"`（PowerShell）

## 可选

暂无（后续落库/真鉴权/支付对接时补充）。

## 验收路径

- 启动：`cd modules/02-backend-core && npm run dev`
- 健康检查：`curl.exe http://localhost:%PORT%/health`（按实际端口替换）

