import React from "react";
import { Link } from "react-router-dom";

type Metric = {
  label: string;
  value: string;
  hint?: string;
};

type TrendPoint = {
  day: string;
  activeUsers: number;
  accuracy: number;
  completion: number;
};

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export function DashboardPage() {
  const [days, setDays] = React.useState(7);

  const points = React.useMemo<TrendPoint[]>(() => {
    const out: TrendPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const seed = (d.getDate() + d.getMonth() * 31) % 100;
      const activeUsers = 120 + (seed % 30);
      const accuracy = 0.62 + ((seed % 15) / 100);
      const completion = 0.48 + ((seed % 20) / 100);
      out.push({
        day: `${d.getMonth() + 1}/${d.getDate()}`,
        activeUsers,
        accuracy,
        completion,
      });
    }
    return out;
  }, [days]);

  const latest = points[points.length - 1];
  const metrics: Metric[] = [
    { label: "活跃用户（DAU）", value: `${latest.activeUsers}`, hint: "占位数据" },
    { label: "正确率", value: pct(latest.accuracy), hint: "占位数据" },
    { label: "完成率", value: pct(latest.completion), hint: "占位数据" },
  ];

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <label className="muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            近
            <select
              className="input"
              style={{ width: 120 }}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={7}>7 天</option>
              <option value={14}>14 天</option>
              <option value={30}>30 天</option>
            </select>
          </label>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>数据看板（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：展示活跃/正确率/完成率的示例趋势；真实指标口径与接口以 99-hub 定稿为准。
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 12 }}>
        {metrics.map((m) => (
          <div key={m.label} className="card">
            <div className="muted">{m.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
            {m.hint ? (
              <div className="muted" style={{ fontSize: 12 }}>
                {m.hint}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 style={{ margin: 0 }}>近 {days} 天趋势（占位）</h3>
          <span className="muted" style={{ fontSize: 12 }}>
            day / active / accuracy / completion
          </span>
        </div>
        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["日期", "活跃", "正确率", "完成率"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 6px", borderBottom: "1px solid #eee" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.day}>
                  <td style={{ padding: "8px 6px", borderBottom: "1px solid #f2f2f2" }}>{p.day}</td>
                  <td style={{ padding: "8px 6px", borderBottom: "1px solid #f2f2f2" }}>{p.activeUsers}</td>
                  <td style={{ padding: "8px 6px", borderBottom: "1px solid #f2f2f2" }}>{pct(p.accuracy)}</td>
                  <td style={{ padding: "8px 6px", borderBottom: "1px solid #f2f2f2" }}>{pct(p.completion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

