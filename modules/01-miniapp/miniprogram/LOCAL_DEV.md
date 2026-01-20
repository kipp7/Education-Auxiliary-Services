# 本地开发（微信开发者工具）

## 1. 导入项目

微信开发者工具 → 导入项目：

- 项目目录：`modules/01-miniapp/miniprogram`
- AppID：没有可先选「不使用 AppID」（仅本地调试）

## 2. 使用 Mock 数据跑通 MVP

默认配置位于 `config/index.js`：

- `USE_MOCK: true`：使用 `utils/mockData.js`
- `USE_MOCK: false`：使用 `utils/request.js` + `API_BASE_URL`

建议先保持 `USE_MOCK: true`，验证最小闭环：

- 首页 → 题库列表 → 练习：可进入、可做题、可展示答案/解析
- 首页 → 考试：可随机抽题、倒计时、交卷到结果页

## 3. 常见开发者工具设置（可选）

若遇到网络相关报错（非 Mock 场景），可在微信开发者工具「详情 → 本地设置」检查：

- 是否勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」

