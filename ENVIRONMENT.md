# 环境配置总表（所有变更同步在这里）

> 目标：让任何一个新开 Codex CLI 窗口/开发者在 30 分钟内跑起对应模块。

## 1. 通用（必装）

### Windows
- Windows 10/11
- PowerShell 5+（建议 7+）

### Git
- 安装 Git（已检测到 git 可用）

### Node.js
- 建议 Node.js 18+（当前环境：Node 20.x）
- npm 9+（当前环境：npm 10.x）

## 2. 微信小程序（01-miniapp）

### 微信开发者工具
- 安装最新版“微信开发者工具”
- 导入项目目录：`modules/01-miniapp/miniprogram`

### AppID
- 开发阶段可以先用测试 AppID
- 后续替换 `modules/01-miniapp/miniprogram/project.config.json` 中的 `appid`

### 网络与域名
- 联调阶段可临时关闭“域名校验”（仅开发环境）
- 上线前必须在微信公众平台配置：
  - request 合法域名
  - uploadFile 合法域名
  - downloadFile 合法域名

### 数据源切换（Mock / API）
- 配置文件：`modules/01-miniapp/miniprogram/config/index.js`
  - `USE_MOCK: true`：走 Mock（`utils/mockData.js`）
  - `USE_MOCK: false`：走真实后端（需填写 `API_BASE_URL`）

## 3. 后端（02-backend-core / 03-importer）

> 当前阶段先做接口契约与最小可用服务，具体技术栈在 OpenSpec 决定后补充。

建议统一：
- API Base URL：`https://<domain>/api`
- 统一认证方式：微信登录态 → 服务端 session/token（由 02 模块定）

## 4. 变更记录（手动维护）

按时间倒序追加：

- YYYY-MM-DD：描述本次环境变更（安装/版本/配置项/影响模块）

