# 03-importer 挂机执行指南（窗口一次性跑完）

目标：先把“文件夹/zip → 解析 → 题目 IR”跑通，哪怕先只支持 txt 模板。

## 0. 约束
- 只改 `modules/03-importer/**`
- 先定 IR，再写 parser；IR 与错误码对齐写到 `modules/99-hub/REQUESTS.md`

## 1. 开工指令（一次）
```bash
git fetch --all
git checkout main
git pull --rebase origin main
git checkout -b feat/03-importer-mvp
```

## 2. 挂机里程碑
### M1：题目 IR + txt parser
- 输出：IR 定义（json schema 或 ts 类型）+ txt parser（单选/多选/判断/填空/论述至少占位）
- 输出：错误报告格式（文件名/行号/原因/建议）

### M2：导入任务模型（占位）
- 输出：导入任务状态机（queued/running/done/failed）+ 进度字段

## 3. 输出与汇报
完成里程碑才提交/推送，并把“输入样例/输出样例”写进 `modules/03-importer/CONVERSATION_LOG.txt`。

## 4. 小程序侧回归（可选）
如果 MCP 可用，导入完成后用 `mp_screenshot` 截图验证小程序题库列表/题目页展示是否正常。
