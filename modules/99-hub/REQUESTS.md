# 跨模块请求队列

当某模块需要改动别的模块目录内的文件时，请在这里新增一条请求，由总控窗口统一处理。

模板：

```markdown
## 请求标题
- 发起模块：`modules/xx-...`
- 目标模块：`modules/yy-...`
- 原因：
- 期望改动：
- 影响评估：
```

## 合并请求：01-miniapp（MVP 导航参数编码）
- 分支：`feat/01-miniapp-mvp-urlencode-winE`
- 模块：`modules/01-miniapp`
- 变更摘要：
  - 将题库名称 `menu` 参数做 URL 编码，避免中文/空格导致跳转异常（`pages/category`、`pages/exam-menu`）
- 验收方式：
  - `git fetch && git checkout feat/01-miniapp-mvp-urlencode-winE`
  - 小程序端手动验证：题库名包含中文/空格时，点击进入练习/考试不应出现跳转异常

