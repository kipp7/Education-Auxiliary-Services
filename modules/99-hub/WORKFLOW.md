# 协作与冲突处理（必读）

目标：让多个 Codex CLI 窗口并行开发时 **不互相覆盖**，并且可以稳定合并到 `main`。

## 1. 分支规则（强制）

1) **禁止**直接在 `main` 开发、禁止 push 到 `main`。  
2) 每个窗口、每个任务都用独立分支：`feat/<模块>-<任务>-<窗口>`  
   - 例：`feat/01-miniapp-library-ui-a`
3) 合并只由“总控窗口”执行（一个人负责合并）。

## 1.1 挂机模式（减少频繁汇报）

当用户希望“睡一觉起来看到原型”：
- 每个窗口必须按各自模块的 `AUTOPILOT.md` 连续完成至少 1 个里程碑再汇报。
- 里程碑内不要拆成多个小提交；每个里程碑 1 次 commit+push。

## 2. 开工固定动作（每次必做）

在你的模块 worktree 根目录执行：

```bash
git fetch --all
git checkout main
git pull --rebase origin main
git checkout -b feat/<模块>-<任务>-<窗口>
```

## 3. 提交与推送

```bash
git status
git add <你的模块目录>
git commit -m "<模块>: <一句话>"
git push -u origin HEAD
```

提交后在 `modules/99-hub/REQUESTS.md` 新增合并请求，写清：
- 分支名
- 改动范围（文件/页面）
- 验收方式（打开哪个页面、点哪里）

## 4. push 冲突（被拒）处理

当 push 被拒绝（non-fast-forward）：

```bash
git pull --rebase origin <你的分支名>
# 解决冲突后
git add <冲突文件>
git rebase --continue
git push
```

如果发现你的分支被多人污染（同一个分支多人推）：
1) 停止使用该分支
2) 新建分支重来：`feat/<模块>-<任务>-<窗口>-v2`
3) **不要** `push --force`（除非总控窗口明确要求）

## 6. 合并队列脚本（总控窗口挂机）

总控窗口可以用脚本从 `modules/99-hub/REQUESTS.md` 的“合并队列”读取待合并分支并自动合并到 `main`。

### 6.1 文件路径约定（避免搞混）

以下路径全部是“仓库根目录”下的相对路径：

- 合并队列文件：`modules/99-hub/REQUESTS.md`
- 队列执行脚本：`modules/99-hub/merge_queue.ps1`
- 守护脚本：`modules/99-hub/merge_queue_daemon.ps1`
- 守护日志：`modules/99-hub/merge_queue_daemon.log`
- 合并日志：`modules/99-hub/merge_queue.log`

Windows 示例（你的机器上仓库根目录可能是类似）：`E:\学校\02 项目\98 其他小项目\02_YL`
因此队列文件就是：`E:\学校\02 项目\98 其他小项目\02_YL\modules\99-hub\REQUESTS.md`

### 6.2 入队规则（让自动化真正生效）

自动合并只看 `main` 上的 `modules/99-hub/REQUESTS.md`，并且只识别“待合并队列项”：

- `- [ ] \`feat/xxx\``（推荐写法）
- `- [ ] feat/xxx`（兼容写法）

注意：仅仅 “push 了 feat 分支 / GitHub 出现 Compare & pull request” **不会**触发自动合并；必须把待合并分支写入队列。

### 6.3 强烈推荐：所有窗口用“入队分支”提交合并请求（只改一个文件）

为了进一步减少人工步骤（不用手工把队列更新合入 main），每个窗口在 push 自己的业务分支 `feat/<模块>-...` 后，再 push 一个“入队分支”：

- 分支命名：`feat/99-hub-request-<模块>-<短描述>`
- **只允许修改 1 个文件**：`modules/99-hub/REQUESTS.md`（不要带别的文件改动，否则会被守护脚本跳过）
- 入队分支里必须在“合并队列”段落新增 `- [ ] ...`，并在下方新增 `## 合并请求：...` 的验收说明

总控守护脚本开启 `-AutoMergeQueueUpdates` 时，会自动把满足条件的 `feat/99-hub-request-*` 合入 `main`，然后再按队列合并对应业务分支。

推荐流程：

```powershell
# 1) 先演练（不会改动仓库）
pwsh modules/99-hub/merge_queue.ps1 -DryRun -ForceFetch

# 2) 正式执行（会 merge + push，并将队列标记为已合并）
pwsh modules/99-hub/merge_queue.ps1 -ForceFetch
```

### 守护模式（一直挂着）

当你希望像“后端服务”一样一直运行：有新分支加入合并队列就自动合并。

```powershell
# 每 2 分钟检查一次合并队列，有待合并项就自动 merge+push
pwsh modules/99-hub/merge_queue_daemon.ps1 -ForceFetch -IntervalSeconds 120

# 自动把入队分支（feat/99-hub-request-*）合入 main，并继续处理合并队列
pwsh modules/99-hub/merge_queue_daemon.ps1 -ForceFetch -AutoMergeQueueUpdates -IntervalSeconds 120
```

注意：
- 只能启动 **一个** 守护进程；多开会相互抢占导致失败。
- 如果出现冲突，脚本会报错并等待下个周期；需要人工处理冲突后再继续。

约定：
- 合并队列条目使用 `- [ ] \`feat/...\`` 表示待合并
- 脚本会在成功后将其标记为 `- [x]` 并写入 `modules/99-hub/merge_queue.log`

## 5. 模块边界（避免踩踏）

- `modules/01-miniapp/**`：小程序前端（UI/路由/授权/本地缓存）
- `modules/02-backend-core/**`：后端 API 与数据模型
- `modules/03-importer/**`：导入流水线与解析器
- `modules/04-admin-console/**`：管理台
- `modules/99-hub/**`：总控与契约/验收

跨模块需求只能写入：`modules/99-hub/REQUESTS.md`
