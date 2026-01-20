# 接口契约状态（99-hub）

> 目的：给各模块一个“当前契约推进到哪了”的单点入口，减少口头对齐成本。

## 1) 契约形式（已选择：OpenAPI 3.1）

- 决定：采用 OpenAPI 3.1（YAML/JSON）作为接口契约单一来源
- 说明：数据模型建议复用 JSON Schema（OAS 3.1 原生支持），便于前后端/Mock/校验工具共用
- 待落地（路径/流程）：
  - 建议契约存放在仓库单独目录（避免分散到各模块）
  - 建议消费方式：miniapp mock 与后端路由均从同一份 OpenAPI 生成/校验

## 2) 统一返回结构（草案）

- 成功返回：`{ data, meta? }`
- 错误返回：`{ error: { code, message, details? }, meta? }`

## 3) 鉴权（草案）

- 登录：`POST /auth/wechat`（code → session/token）
- token 刷新策略：见下方鉴权草案

## 4) 题目通用数据结构（待起草）

- 题型、选项、答案、解析、素材（图片/音频/富文本）统一字段：待 99-hub 汇总后落地

## 5) 错误码与返回结构（草案）

- 见 `modules/99-hub/ERRORS.md`

## 6) 鉴权与刷新（草案）

- 见 `modules/99-hub/AUTH.md`
