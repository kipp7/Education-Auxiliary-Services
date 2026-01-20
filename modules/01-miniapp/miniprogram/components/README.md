# Components（小程序公共组件）

建议把可复用的 UI 组件放在这里，例如：

- `components/common/`：按钮、弹窗、空状态、加载态、题目选项组件等
- `components/business/`：题目卡片、答题卡、题库包卡片等

注意：组件对外数据结构应跟随 `modules/00-shared/contract/` 的接口契约，避免后期联调大改。

