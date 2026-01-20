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

推荐流程：

```powershell
# 1) 先演练（不会改动仓库）
pwsh modules/99-hub/merge_queue.ps1 -DryRun -ForceFetch

# 2) 正式执行（会 merge + push，并将队列标记为已合并）
pwsh modules/99-hub/merge_queue.ps1 -ForceFetch
```

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
