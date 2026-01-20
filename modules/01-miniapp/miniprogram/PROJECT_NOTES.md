# 项目说明（当前阶段：先做小程序）

## 当前策略

- 先让小程序用 **Mock 数据**跑通：题库列表 → 进入练习/考试 → 做题流程。
- 等客户确认后端/导入格式与接口后，再把 Mock 切换成真实 API。

## 本地运行（微信开发者工具）

1) 打开微信开发者工具 → 导入项目
- 项目目录选择：`modules/01-miniapp/miniprogram`
- AppID：没有可先选“不使用 AppID”（仅本地调试）

2) 运行与验证（Mock 模式）
- 默认 `config/index.js` 为 `USE_MOCK: true`
- 首页 → 题库列表 → 进入练习/考试：应能正常加载题目并展示答案/解析

## 如何切换数据源

在 `config/index.js`：

- `USE_MOCK: true`：走 `utils/mockData.js`
- `USE_MOCK: false`：走 `utils/request.js` 访问 `API_BASE_URL`

## 已改造点

- 不再依赖 Bmob / `menuDetail.questionUrl` 的直连 JSON 方式。
- 练习、考试、错题页统一通过 `wx.u.getQuestionsForMenu(menuId)` 取题。

