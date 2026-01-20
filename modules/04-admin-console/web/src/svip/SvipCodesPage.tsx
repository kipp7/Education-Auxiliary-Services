import React from "react";
import { Link } from "react-router-dom";
import { useSvipStore } from "./store";
import { SvipCode } from "./types";

function formatTime(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function toCsv(items: SvipCode[]) {
  const header = ["code", "status", "validUntil", "createdAt", "redeemedAt"].join(",");
  const rows = items.map((c) =>
    [c.code, c.status, c.validUntil ?? "", c.createdAt, c.redeemedAt ?? ""]
      .map((x) => `"${String(x).replaceAll("\"", "\"\"")}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SvipCodesPage() {
  const { state, actions } = useSvipStore();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.codes;
    return state.codes.filter((c) => c.code.toLowerCase().includes(q));
  }, [query, state.codes]);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button className="btn" onClick={actions.resetToSeed}>
            重置示例数据
          </button>
          <button
            className="btn"
            onClick={() => {
              const text = toCsv(filtered);
              downloadText(`svip-codes-${Date.now()}.csv`, text);
            }}
          >
            导出 CSV（占位）
          </button>
          <button
            className="btn primary"
            onClick={() => {
              const countRaw = prompt("生成数量", "10");
              if (!countRaw) return;
              const count = Number(countRaw);
              if (!Number.isFinite(count) || count <= 0 || count > 500) {
                alert("数量需为 1~500");
                return;
              }
              const validDaysRaw = prompt("有效期（天，留空表示永久）", "30") ?? "";
              const validDays = validDaysRaw.trim() ? Number(validDaysRaw) : null;
              if (validDaysRaw.trim() && (!Number.isFinite(validDays) || validDays! <= 0)) {
                alert("有效期需为正整数或留空");
                return;
              }
              actions.generateBatch(count, validDays);
            }}
          >
            批量生成（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>SVIP 码管理</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例数据 + 生成/导出/注销；真实字段与绑定记录以 99-hub 定稿为准。
        </p>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索 code"
        />
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {filtered.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              无数据
            </p>
          </div>
        ) : (
          filtered.map((c) => (
            <div key={c.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {c.id} · {c.status}
                  </div>
                  <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {c.code}
                  </div>
                  <div className="muted">
                    createdAt: {formatTime(c.createdAt)} · validUntil: {formatTime(c.validUntil)}
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button
                    className="btn"
                    disabled={c.status === "REVOKED"}
                    onClick={() => {
                      if (!confirm("确认将该码标记为注销？")) return;
                      actions.revoke(c.id);
                    }}
                  >
                    注销
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

