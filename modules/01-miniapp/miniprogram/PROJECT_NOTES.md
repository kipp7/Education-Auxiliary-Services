# 项目说明（当前阶段：先做小程序）

## 当前策略

- 先让小程序用 **Mock 数据**跑通：题库列表 → 进入练习/考试 → 做题流程。
- 等客户确认后端/导入格式与接口后，再把 Mock 切换成真实 API。

## 如何切换数据源

在 `config/index.js`：

- `USE_MOCK: true`：走 `utils/mockData.js`
- `USE_MOCK: false`：走 `utils/request.js` 访问 `API_BASE_URL`

## 已改造点

- 不再依赖 Bmob / `menuDetail.questionUrl` 的直连 JSON 方式。
- 练习、考试、错题页统一通过 `wx.u.getQuestionsForMenu(menuId)` 取题。

