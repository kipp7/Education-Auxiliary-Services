# 小程序端（miniprogram）

目录：`modules/01-miniapp/miniprogram`

## 入口与页面

- 入口页：`pages/start/index`
- 首页（Tab）：`pages/index/index`
- 题库（Tab）：`pages/library/index`
- 资讯（Tab）：`pages/news/index`
- 我的（Tab）：`pages/my/index`

## 本地开发

- 快速说明：`PROJECT_NOTES.md`
- 详细步骤：`LOCAL_DEV.md`

## 数据源切换

在 `config/index.js`：

- `USE_MOCK: true`：走 `utils/mockData.js`
- `USE_MOCK: false`：走 `utils/request.js` 并配置 `API_BASE_URL`

## 品牌文案

统一配置在 `config/index.js`：`APP_NAME` / `COMPANY_NAME` / `SUPPORT_TEXT`

