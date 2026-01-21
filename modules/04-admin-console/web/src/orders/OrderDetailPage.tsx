import React from "react";
import { Link, useParams } from "react-router-dom";
import { useOrdersStore } from "./store";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function formatPrice(cny: number) {
  if (!Number.isFinite(cny)) return "-";
  return `¥${cny.toFixed(2)}`;
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, actions } = useOrdersStore();
  const order = state.orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="container">
        <div className="nav">
          <Link to="/orders">← 返回</Link>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>订单详情</h2>
          <p className="muted" style={{ margin: 0 }}>
            未找到该订单
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav">
        <Link to="/orders">← 返回</Link>
        <div className="row">
          <button
            className="btn"
            onClick={() =>
              actions.setInvoiceStatus(
                order.id,
                order.invoiceStatus === "NONE" ? "REQUESTED" : "NONE",
              )
            }
          >
            {order.invoiceStatus === "NONE" ? "申请发票（占位）" : "取消发票（占位）"}
          </button>
          <button
            className="btn"
            onClick={() => actions.setStatus(order.id, order.status === "REFUNDED" ? "PAID" : "REFUNDED")}
          >
            {order.status === "REFUNDED" ? "恢复支付" : "标记退款"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="muted" style={{ fontSize: 12 }}>
          {order.id} · {order.status} · invoice:{order.invoiceStatus}
        </div>
        <h2 style={{ marginTop: 8 }}>
          {order.userDisplayName} · {formatPrice(order.totalCny)}
        </h2>
        <div className="muted">
          createdAt: {formatTime(order.createdAt)} · updatedAt: {formatTime(order.updatedAt)}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>商品明细</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {order.items.map((i) => (
            <div key={i.id} className="row" style={{ justifyContent: "space-between" }}>
              <span>
                {i.title} x{i.quantity}
              </span>
              <span className="muted">{formatPrice(i.priceCny)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>发票申请（预留）</h3>
        <p className="muted" style={{ margin: 0 }}>
          当前仅保留 invoiceStatus 状态位；后续可接入真实发票申请表单与审批流。
        </p>
      </div>
    </div>
  );
}

