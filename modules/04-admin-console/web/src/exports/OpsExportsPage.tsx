import React from "react";
import { Link } from "react-router-dom";

function downloadJson(filename: string, data: unknown) {
  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function OpsExportsPage() {
  const opsConfig = React.useMemo(() => {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      news: [
        {
          id: "news_1",
          title: "公告：系统维护说明（占位）",
          summary: "这里是摘要（占位），真实字段以 99-hub 定稿为准。",
          content: "这里是正文（占位）。",
          status: "PUBLISHED",
          updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ],
      recommendations: {
        questionBanks: [{ id: "pkg_math_1", title: "初一上·同步题（占位）" }],
        courses: [{ id: "crs_1", title: "有理数入门（占位）" }],
        plans: [{ id: "plan_1", title: "月度会员（占位）" }],
      },
      plans: [
        {
          id: "plan_1",
          name: "月度会员（占位）",
          priceCents: 2999,
          durationDays: 30,
          benefits: "解锁所有题库（占位）",
          enabled: true,
        },
      ],
    };
  }, []);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button
            className="btn primary"
            onClick={() => downloadJson("ops-config.json", opsConfig)}
          >
            导出 ops-config.json
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>运营/商业配置导出（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为 M6 占位：导出 news/recommendations/plans，供小程序 Mock 读取；真实字段与存放路径以 99-hub
          定稿为准。
        </p>
        <pre style={{ margin: 0, overflow: "auto", maxHeight: 360 }}>
          {JSON.stringify(opsConfig, null, 2)}
        </pre>
      </div>
    </div>
  );
}

