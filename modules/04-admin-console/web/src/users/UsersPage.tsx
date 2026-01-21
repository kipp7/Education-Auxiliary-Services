import React from "react";
import { Link } from "react-router-dom";
import { useSvipStore } from "../svip/store";
import { useUsersStore } from "./store";

function formatTime(iso: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function UsersPage() {
  const { state, actions } = useUsersStore();
  const { actions: svipActions } = useSvipStore();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.users;
    return state.users.filter((u) => u.displayName.toLowerCase().includes(q) || u.id.includes(q));
  }, [query, state.users]);

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
              actions.addUser(name);
            }}
          >
            新增用户（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>用户与权益（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例用户 + SVIP 激活码绑定；真实字段与接口以 99-hub 定稿为准。
        </p>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索用户（ID/昵称）"
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
          filtered.map((u) => (
            <div key={u.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {u.id} · {u.status}
                  </div>
                  <div style={{ fontWeight: 600 }}>{u.displayName}</div>
                  <div className="muted">
                    VIP 有效期：{formatTime(u.vipValidUntil)} · 更新：{formatTime(u.updatedAt)}
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const name = prompt("新昵称", u.displayName);
                      if (name === null) return;
                      actions.renameUser(u.id, name);
                    }}
                  >
                    重命名
                  </button>
                  <button className="btn" onClick={() => actions.toggleStatus(u.id)}>
                    {u.status === "ACTIVE" ? "禁用" : "启用"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      const code = prompt("输入激活码（如 ABCD-EFGH-JKLM-NPQR）", "");
                      if (!code) return;
                      const res = svipActions.redeemByCode(code, u.id);
                      if (!res.ok) {
                        alert(res.reason);
                        return;
                      }
                      actions.addBinding(
                        u.id,
                        res.code.code,
                        res.code.validUntil,
                        res.code.redeemedAt!,
                      );
                    }}
                  >
                    绑定激活码（占位）
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该用户？")) return;
                      actions.removeUser(u.id);
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>

              {u.bindings.length > 0 ? (
                <div style={{ marginTop: 10 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                    绑定记录（最近 {Math.min(u.bindings.length, 5)} 条）
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {u.bindings.slice(0, 5).map((b) => (
                      <div key={b.id} className="row" style={{ justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                          {b.code}
                        </span>
                        <span className="muted">
                          {formatTime(b.redeemedAt)} · validUntil: {formatTime(b.validUntil)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

