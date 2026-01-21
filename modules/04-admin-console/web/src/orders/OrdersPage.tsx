import React from "react";
import { Link } from "react-router-dom";
import { useOrdersStore } from "./store";
import { OrderStatus } from "./types";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function formatPrice(cny: number) {
  if (!Number.isFinite(cny)) return "-";
  return `¥${cny.toFixed(2)}`;
}

export function OrdersPage() {
  const { state, actions } = useOrdersStore();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<OrderStatus | "ALL">("ALL");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!q) return true;
      return o.id.includes(q) || o.userDisplayName.toLowerCase().includes(q);
    });
  }, [query, state.orders, status]);

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
              const name = prompt("用户昵称", "新用户");
              if (name === null) return;
              const totalRaw = prompt("订单金额（元）", "19.9");
              if (!totalRaw) return;
              const total = Number(totalRaw);
              if (!Number.isFinite(total) || total < 0) {
                alert("金额需为非负数字");
                return;
              }
              actions.createOrder(name, total);
            }}
          >
            新建订单（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>订单管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：订单列表 + 发票申请状态；真实字段与发票流程以 99-hub 定稿为准。
        </p>
        <div className="row">
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索订单（ID/用户）"
          />
          <select
            className="input"
            style={{ width: 160 }}
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus | "ALL")}
          >
            <option value="ALL">全部状态</option>
            <option value="PAID">PAID</option>
            <option value="REFUNDED">REFUNDED</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {filtered.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              无数据
            </p>
          </div>
        ) : (
          filtered.map((o) => (
            <div key={o.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {o.id} · {o.status} · invoice:{o.invoiceStatus} · {formatTime(o.updatedAt)}
                  </div>
                  <div style={{ fontWeight: 700 }}>
                    {o.userDisplayName} · {formatPrice(o.totalCny)}
                  </div>
                  <div className="muted">{o.items.map((i) => `${i.title} x${i.quantity}`).join(" · ")}</div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <Link className="btn" to={`/orders/${o.id}`}>
                    详情
                  </Link>
                  <button
                    className="btn"
                    onClick={() =>
                      actions.setInvoiceStatus(
                        o.id,
                        o.invoiceStatus === "NONE" ? "REQUESTED" : "NONE",
                      )
                    }
                    title="发票申请：占位状态切换"
                  >
                    {o.invoiceStatus === "NONE" ? "申请发票" : "取消发票"}
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      actions.setStatus(o.id, o.status === "PAID" ? "CANCELED" : "PAID")
                    }
                  >
                    {o.status === "PAID" ? "取消" : "恢复支付"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该订单？")) return;
                      actions.removeOrder(o.id);
                    }}
                  >
                    删除
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

