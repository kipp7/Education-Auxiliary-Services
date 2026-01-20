# 01-miniapp 挂机执行指南（窗口一次性跑完）

目标：你只需要启动一次，让窗口连续完成一批任务点后再汇报，减少“继续/确认”往返。

## 今晚挂机建议（8–10 小时）
> 如果你希望“一觉醒来原型可演示”，建议连续做到 **M6**，中途只在 M2/M4/M6 三个节点各提交一次即可。

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

#### MCP 验收（必须）
完成 M1 后，用 MCP 自动化跑一遍并截图留档：
1) `mp_ensureConnection`（确保会话就绪）
2) `mp_navigate`：`/pages/start/index` → 点击“立即进入” → 依次 `switchTab` 到 4 个 tab
3) `mp_screenshot`：保存至少 5 张关键页面截图到 `modules/01-miniapp/_evidence/M1/`
4) `mp_getLogs`：导出日志到 `modules/01-miniapp/_evidence/M1/logs.json`（获取后清空也可以）

### M2：题库页（初中/单招）信息结构跑通（Mock）
- 目标：`初中/单招` 两条入口 → 列表能展开/选择 → 进入“单元详情/题型详情”占位页。
- 先做交互与路由，不做真实数据对接。

#### MCP 验收（必须）
- `mp_navigate` 到题库页，切换“初中/单招/年级/题型”
- `mp_screenshot`：保存关键路径截图到 `modules/01-miniapp/_evidence/M2/`
- `mp_getLogs`：保存日志到 `modules/01-miniapp/_evidence/M2/logs.json`

### M3：课程页视频列表 + 播放页（Mock）+ 续播记录（本地）
- 目标：视频列表（封面/标题/简介/时长）→ 播放页 → 记录并恢复上次播放位置（用 storage 模拟）。

#### MCP 验收（必须）
- `mp_navigate`：课程列表 → 播放页 → 返回 → 再次进入同一视频验证续播提示
- `mp_screenshot`：保存截图到 `modules/01-miniapp/_evidence/M3/`
- `mp_getLogs`：保存日志到 `modules/01-miniapp/_evidence/M3/logs.json`

### M4：SVIP 绑定（UI + 本地验证占位）
- 目标：我的页提供“SVIP码绑定”入口；输入框 + 校验提示；先用本地 mock（后续接后端）。
- 同时加“未开通提示”（paywall 文案）占位。

#### MCP 验收（必须）
- `mp_navigate`：我的页 → SVIP 绑定页 → 输入错误码/正确码（mock）验证提示
- `mp_screenshot`：保存截图到 `modules/01-miniapp/_evidence/M4/`

### M5：整体视觉统一（不追求极致，但要可演示）
- 目标：按参考图对齐信息密度：banner、快捷入口、列表卡片、空状态。
- 不要花太多时间打磨动画细节；以“可验收原型”为主。

#### MCP 验收（必须）
- 全路径走查（封面→首页→题库→课程→我的），截“对外展示”的 8–12 张图存到 `modules/01-miniapp/_evidence/M5/`

### M6：按需求文档补齐“题库/课程/我的”关键交互（仍可 Mock）
> 目标：把需求规格说明书里最关键的“结构与入口”补齐，方便客户验收原型。

- 题库页：
  - [ ] 顶部轮播（先用本地 mock 图片数组）
  - [ ] 年级段选择：`初中` / `单招`
  - [ ] 初中：年级 → 上下册 → 科目（按教学进度隐藏物理/化学）
  - [ ] 单招：科目 → 题型（选择/判断/论述）
  - [ ] 单元资源入口：`同步试题(预览)` 与 `在线做题(练习/测评)`（预览/练习可先占位）
- 课程页：
  - [ ] 与题库同结构筛选（先用 Mock 数据）
  - [ ] 列表显示“观看进度”（读本地 storage）
  - [ ] 播放页“已学/未学”切换（本地）
- 我的页：
  - [ ] SVIP 绑定入口与状态展示（本地）
  - [ ] 学习记录（视频/做题）占位列表（本地）

#### MCP 验收（必须）
- 从首页/题库/课程/我的把关键入口全点一遍，截图保存到 `modules/01-miniapp/_evidence/M6/`

## 3. 输出与汇报（只在完成里程碑后做一次）
每完成一个里程碑：
1) `git status` 确认只改了本模块
2) `git add modules/01-miniapp`
3) `git commit -m "01-miniapp: prototype Mx"`
4) `git push -u origin HEAD`
5) 在 `modules/01-miniapp/CONVERSATION_LOG.txt` 追加：
   - 完成了哪些页面/路由
   - 现在如何从封面一路点到各页（验收路径）
6) 贴上 `_evidence/Mx/` 目录的文件清单（有哪些截图/日志）
