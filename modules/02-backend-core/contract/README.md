# contract 说明

本目录用于存放接口契约（草案/定稿），供前端/小程序/管理台联调与对齐。

## 文件

- `mvp.openapi.yaml`：02-backend-core 的 MVP OpenAPI 草案（最终以 99-hub 定稿为准）

## 使用建议

- 前端联调时：优先对照 `mvp.openapi.yaml` 的 path / request / response
- 后端实现时：先改契约，再改实现；避免接口漂移

