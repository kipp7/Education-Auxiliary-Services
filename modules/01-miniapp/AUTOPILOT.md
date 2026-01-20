# 01-miniapp 挂机执行指南（窗口一次性跑完）

目标：你只需要启动一次，让窗口连续完成一批任务点后再汇报，减少“继续/确认”往返。

## 0. 约束（必须遵守）
- 只改 `modules/01-miniapp/**`
- 不要调整别的模块的文件（需要就写到 `modules/99-hub/REQUESTS.md`）
- 不要把 `图片/`、`*.docx` 等本地资料提交到 git

## 1. 开工指令（一次）
```bash
git fetch --all
git checkout main
git pull --rebase origin main
git checkout -b feat/01-miniapp-prototype
```

## 2. 挂机里程碑（按顺序做，做到一个里程碑完成才停）

### M1：底部导航 + 三大主页面骨架（题库/课程/我的）
- 目标：能从底部 tab 进入 3 页，页面结构按原型图搭好（先用 Mock/静态）。
- 文件范围（尽量只动这些，避免冲突）：  
  - `miniprogram/app.json`（tabBar）
  - `miniprogram/pages/library/**`（题库页）
  - `miniprogram/pages/course/**`（课程页，新建）
  - `miniprogram/pages/my/**`（我的页）

### M2：题库页（初中/单招）信息结构跑通（Mock）
- 目标：`初中/单招` 两条入口 → 列表能展开/选择 → 进入“单元详情/题型详情”占位页。
- 先做交互与路由，不做真实数据对接。

### M3：课程页视频列表 + 播放页（Mock）+ 续播记录（本地）
- 目标：视频列表（封面/标题/简介/时长）→ 播放页 → 记录并恢复上次播放位置（用 storage 模拟）。

### M4：SVIP 绑定（UI + 本地验证占位）
- 目标：我的页提供“SVIP码绑定”入口；输入框 + 校验提示；先用本地 mock（后续接后端）。
- 同时加“未开通提示”（paywall 文案）占位。

### M5：整体视觉统一（不追求极致，但要可演示）
- 目标：按参考图对齐信息密度：banner、快捷入口、列表卡片、空状态。
- 不要花太多时间打磨动画细节；以“可验收原型”为主。

## 3. 输出与汇报（只在完成里程碑后做一次）
每完成一个里程碑：
1) `git status` 确认只改了本模块
2) `git add modules/01-miniapp`
3) `git commit -m "01-miniapp: prototype Mx"`
4) `git push -u origin HEAD`
5) 在 `modules/01-miniapp/CONVERSATION_LOG.txt` 追加：
   - 完成了哪些页面/路由
   - 现在如何从封面一路点到各页（验收路径）

