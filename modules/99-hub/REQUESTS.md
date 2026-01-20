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

## 合并请求：01-miniapp（练习页本地收藏）
- 分支：`feat/01-miniapp-favorite-local-winE2`
- 模块：`modules/01-miniapp`
- 变更摘要：
  - 练习页支持收藏/取消收藏（本地 storage：`fav_<cateid>`）
- 验收方式：
  - `git fetch && git checkout feat/01-miniapp-favorite-local-winE2`
  - 进入练习页，点击底部栏收藏按钮，提示“已收藏/已取消收藏”，切换题目后状态应随之更新

