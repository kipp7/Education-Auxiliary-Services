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


## 合并请求：选择契约形式（OpenAPI 3.1）
- 分支：`feat/99-hub-contract-choice-v2`
- 目标：合并到 `main`
- 变更摘要：新增 CONTRACT.md 并在 TASKS 勾选完成
- 验收方式：
  - `git fetch origin`
  - `git checkout feat/99-hub-contract-choice-v2`
  - 查看 `modules/99-hub/CONTRACT.md` 与 `modules/99-hub/TASKS.md`
