import React from "react";
import { Link } from "react-router-dom";
import { usePlansStore } from "./store";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function formatPrice(cny: number) {
  if (!Number.isFinite(cny)) return "-";
  return `¥${cny.toFixed(2)}`;
}

export function PlansPage() {
  const { state, actions } = usePlansStore();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.plans;
    return state.plans.filter((p) => p.name.toLowerCase().includes(q) || p.id.includes(q));
  }, [query, state.plans]);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button className="btn" onClick={actions.resetToSeed}>
            重置示例数据
          </button>
          <button
            className="btn primary"
            onClick={() => {
              const name = prompt("套餐名称", "新套餐");
              if (name === null) return;
              const priceRaw = prompt("价格（元）", "19.9");
              if (!priceRaw) return;
              const price = Number(priceRaw);
              if (!Number.isFinite(price) || price < 0) {
                alert("价格需为非负数字");
                return;
              }
              const daysRaw = prompt("有效期（天）", "30");
              if (!daysRaw) return;
              const days = Number(daysRaw);
              if (!Number.isFinite(days) || days <= 0) {
                alert("有效期需为正整数");
                return;
              }
              actions.addPlan(name, price, days);
            }}
          >
            新增套餐（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>套餐管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例套餐 + 权益条目；真实字段与订单/发票联动以 99-hub 定稿为准。
        </p>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索套餐（ID/名称）"
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
          filtered.map((p) => (
            <div key={p.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {p.id} · {p.status}
                  </div>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div className="muted">
                    {formatPrice(p.priceCny)} · {p.durationDays} 天 · 更新 {formatTime(p.updatedAt)}
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const name = prompt("套餐名称", p.name);
                      if (name === null) return;
                      actions.updatePlan(p.id, { name });
                    }}
                  >
                    重命名
                  </button>
                  <button
                    className="btn"
                    onClick={() => actions.updatePlan(p.id, { status: p.status === "ACTIVE" ? "DRAFT" : "ACTIVE" })}
                  >
                    {p.status === "ACTIVE" ? "下线" : "上线"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      const raw = prompt("价格（元）", String(p.priceCny));
                      if (!raw) return;
                      const price = Number(raw);
                      if (!Number.isFinite(price) || price < 0) {
                        alert("价格需为非负数字");
                        return;
                      }
                      actions.updatePlan(p.id, { priceCny: price });
                    }}
                  >
                    改价
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      const raw = prompt("有效期（天）", String(p.durationDays));
                      if (!raw) return;
                      const days = Number(raw);
                      if (!Number.isFinite(days) || days <= 0) {
                        alert("有效期需为正整数");
                        return;
                      }
                      actions.updatePlan(p.id, { durationDays: days });
                    }}
                  >
                    改有效期
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该套餐？")) return;
                      actions.removePlan(p.id);
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    权益（{p.benefits.length}）
                  </div>
                  <button
                    className="btn"
                    onClick={() => {
                      const text = prompt("新增权益条目", "权益说明（占位）");
                      if (text === null) return;
                      actions.addBenefit(p.id, text);
                    }}
                  >
                    新增权益
                  </button>
                </div>

                {p.benefits.length === 0 ? (
                  <div className="muted" style={{ marginTop: 6 }}>
                    暂无权益条目
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                    {p.benefits.map((b) => (
                      <div key={b.id} className="row" style={{ justifyContent: "space-between" }}>
                        <span>{b.text}</span>
                        <button className="btn" onClick={() => actions.removeBenefit(p.id, b.id)}>
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

