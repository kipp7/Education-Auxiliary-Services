# Project Context

## Purpose
为教育机构提供“题库导入/管理 + 微信小程序刷题/考试/错题/收藏/资讯”的一体化解决方案。

## Tech Stack
- 微信小程序（WXML/WXSS/JS）
- 后端与导入模块：待定（通过 OpenSpec 决策与落地）
- 本地开发工具：Node.js、Git、微信开发者工具

## Project Conventions

### Code Style
- 模块内保持一致即可；跨模块改动由 `modules/99-hub` 统一处理
- 避免在仓库内写入任何账号/密码/密钥等敏感信息（用 `.env`，并已被 `.gitignore` 忽略）

### Architecture Patterns
- 模块化并行开发：每个 Codex CLI 窗口只在自己的 `modules/<xx>/` 下改动
- 小程序与后端通过 API 契约解耦；联调前可用 Mock 跑通流程

### Testing Strategy
- 小程序：以页面关键流程自测为主，后续补自动化（如可行）
- 后端：待定（选型后补单测/集成测试策略）

### Git Workflow
- 分支按模块划分：`module/01-miniapp`、`module/02-backend-core`、`module/03-importer`、`module/04-admin-console`
- 合并到 `main` 建议由总控窗口执行，避免多窗口冲突

## Domain Context
- 核心能力：题库分类（学段/年级/科目/章节/题型等）与题目结构（题干/选项/答案/解析）
- 导入能力：上传文件夹/zip → 解析目录层级 → 识别题目 → 入库 → 小程序消费

## Important Constraints
- 需求可能不完整，优先做“最小闭环”并保持可扩展
- 微信小程序正式域名/权限需要走微信平台配置
- 敏感信息不得入库到 git

## External Dependencies
- 微信公众平台/微信登录能力
