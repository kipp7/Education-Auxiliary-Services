import React from "react";
import { Link } from "react-router-dom";
import { centsToYuan, useOrdersStore } from "./store";
import { Order, OrderStatus, Plan } from "./types";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toOrdersCsv(orders: Order[], plans: Plan[]) {
  const planName = new Map(plans.map((p) => [p.id, p.name]));
  const header = ["orderId", "plan", "status", "userNote", "createdAt"].join(",");
  const rows = orders.map((o) =>
    [o.id, planName.get(o.planId) ?? o.planId, o.status, o.userNote, o.createdAt]
      .map((x) => `"${String(x).replaceAll("\"", "\"\"")}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function promptPlan(defaults?: Partial<Plan>) {
  const name = prompt("套餐名称", defaults?.name ?? "月度会员");
  if (!name?.trim()) return null;
  const priceRaw = prompt("价格（元）", defaults ? String((defaults.priceCents ?? 0) / 100) : "29.99");
  if (!priceRaw?.trim()) return null;
  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0) {
    alert("价格需为正数");
    return null;
  }
  const durationRaw = prompt("有效期（天）", String(defaults?.durationDays ?? 30));
  if (!durationRaw?.trim()) return null;
  const durationDays = Number(durationRaw);
  if (!Number.isFinite(durationDays) || durationDays <= 0) {
    alert("有效期需为正整数（天）");
    return null;
  }
  const benefits = prompt("权益说明", defaults?.benefits ?? "") ?? "";
  const enabledRaw = prompt("是否启用（yes/no）", defaults?.enabled === false ? "no" : "yes") ?? "yes";
  const enabled = enabledRaw.trim().toLowerCase() !== "no";
  return {
    name: name.trim(),
    priceCents: Math.round(price * 100),
    durationDays,
    benefits: benefits.trim(),
    enabled,
  };
}

export function OrdersPage() {
  const { state, actions } = useOrdersStore();
  const [tab, setTab] = React.useState<"plans" | "orders">("plans");

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button className="btn" onClick={actions.resetToSeed}>
            重置示例数据
          </button>
          <button className="btn" onClick={() => setTab("plans")}>
            套餐
          </button>
          <button className="btn" onClick={() => setTab("orders")}>
            订单
          </button>
          {tab === "orders" ? (
            <button
              className="btn"
              onClick={() => downloadText(`orders-${Date.now()}.csv`, toOrdersCsv(state.orders, state.plans))}
            >
              导出 CSV（占位）
            </button>
          ) : null}
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>订单 / 套餐管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例数据 + 套餐配置 + 订单列表；发票申请/支付回调/退款流转以 99-hub 定稿为准。
        </p>
      </div>

      {tab === "plans" ? (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <div className="row">
            <button
              className="btn primary"
              onClick={() => {
                const input = promptPlan();
                if (!input) return;
                actions.createPlan(input);
              }}
            >
              新增套餐
            </button>
          </div>
          {state.plans.length === 0 ? (
            <div className="card">
              <p className="muted" style={{ margin: 0 }}>
                无套餐
              </p>
            </div>
          ) : (
            state.plans.map((p) => (
              <div key={p.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {p.id} · {p.enabled ? "启用" : "停用"} · {p.durationDays} 天
                    </div>
                    <div style={{ fontWeight: 800 }}>
                      {p.name} · ¥{centsToYuan(p.priceCents)}
                    </div>
                    <div className="muted" style={{ whiteSpace: "pre-wrap" }}>
                      {p.benefits || "（无权益说明）"}
                    </div>
                  </div>
                  <div className="row" style={{ alignItems: "flex-start" }}>
                    <button
                      className="btn"
                      onClick={() => {
                        const input = promptPlan(p);
                        if (!input) return;
                        actions.updatePlan(p.id, input);
                      }}
                    >
                      编辑
                    </button>
                    <button className="btn" onClick={() => actions.updatePlan(p.id, { enabled: !p.enabled })}>
                      {p.enabled ? "停用" : "启用"}
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        if (!confirm("删除套餐将同时删除关联订单（占位），是否继续？")) return;
                        actions.deletePlan(p.id);
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
      ) : (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <div className="row">
            <button
              className="btn primary"
              onClick={() => {
                if (state.plans.length === 0) {
                  alert("请先创建套餐");
                  return;
                }
                const planId = prompt("选择套餐 ID", state.plans[0].id);
                if (!planId?.trim()) return;
                if (!state.plans.some((p) => p.id === planId.trim())) {
                  alert("套餐不存在");
                  return;
                }
                const userNote = prompt("用户标识（占位）", "user_123") ?? "";
                actions.createOrder(planId.trim(), userNote.trim());
              }}
            >
              新增订单（占位）
            </button>
          </div>
          {state.orders.length === 0 ? (
            <div className="card">
              <p className="muted" style={{ margin: 0 }}>
                无订单
              </p>
            </div>
          ) : (
            state.orders.map((o) => (
              <div key={o.id} className="card">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {o.id} · {o.status} · {new Date(o.createdAt).toLocaleString()}
                    </div>
                    <div style={{ fontWeight: 700 }}>
                      套餐：{state.plans.find((p) => p.id === o.planId)?.name ?? o.planId}
                    </div>
                    <div className="muted">用户：{o.userNote || "（无）"}</div>
                  </div>
                  <div className="row" style={{ alignItems: "flex-start" }}>
                    <button
                      className="btn"
                      onClick={() => {
                        const next = prompt(
                          "状态（CREATED/PAID/REFUNDED/CANCELED）",
                          o.status,
                        );
                        if (!next?.trim()) return;
                        const status = next.trim().toUpperCase() as OrderStatus;
                        const allowed: OrderStatus[] = ["CREATED", "PAID", "REFUNDED", "CANCELED"];
                        if (!allowed.includes(status)) {
                          alert("状态不合法");
                          return;
                        }
                        actions.setOrderStatus(o.id, status);
                      }}
                    >
                      改状态
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        if (!confirm("确认删除该订单？")) return;
                        actions.deleteOrder(o.id);
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
      )}
    </div>
  );
}

