# 04-admin-console 挂机执行指南（窗口一次性跑完）

目标：先出“可点可看”的管理台原型页（轮播/题库/视频/SVIP），接口后置。

## 0. 约束
- 只改 `modules/04-admin-console/**`
- 不要实现后端；仅做页面骨架与路由

## 1. 开工指令（一次）
```bash
git fetch --all
git checkout main
git pull --rebase origin main
git checkout -b feat/04-admin-console-prototype
```

## 2. 挂机里程碑
### M1：路由骨架 + 4 个管理页面
- 轮播图管理（列表/新增/排序占位）
- 试题管理（列表/导入入口占位）
- 视频管理（列表/上传入口占位）
- SVIP 码管理（生成/导出/绑定记录占位）

## 3. 输出与汇报
完成里程碑才提交/推送，并在 `modules/04-admin-console/CONVERSATION_LOG.txt` 记录“如何跑起来/如何验收”。

## 4. 小程序 MCP（可选）
如果 MCP 可用，用 `mp_screenshot` 把“轮播/题库/课程/我的”四页截图留档，便于对齐管理台配置项。
