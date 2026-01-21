import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function maskToken(token: string | null) {
  if (!token) return "-";
  if (token.length <= 8) return `${token.slice(0, 2)}***${token.slice(-2)}`;
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

export function MePage() {
  const { user, token } = useAuth();
  const [copied, setCopied] = React.useState<null | "roles" | "permissions">(null);

  const rolesText = React.useMemo(() => JSON.stringify(user?.roles ?? [], null, 2), [user?.roles]);
  const permissionsText = React.useMemo(
    () => JSON.stringify(user?.permissions ?? [], null, 2),
    [user?.permissions],
  );

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <span className="muted">token: {maskToken(token)}</span>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>当前用户（RBAC 自检）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          用于验收权限配置；token 默认脱敏展示。
        </p>
        <div className="row">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              id
            </div>
            <div>{user?.id ?? "-"}</div>
          </div>
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              displayName
            </div>
            <div>{user?.displayName ?? "-"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>roles</h3>
            <button
              className="btn"
              onClick={async () => {
                await navigator.clipboard.writeText(rolesText);
                setCopied("roles");
                setTimeout(() => setCopied(null), 1000);
              }}
            >
              {copied === "roles" ? "已复制" : "复制"}
            </button>
          </div>
          <pre style={{ margin: 0, overflow: "auto", maxHeight: 220 }}>{rolesText}</pre>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>permissions</h3>
            <button
              className="btn"
              onClick={async () => {
                await navigator.clipboard.writeText(permissionsText);
                setCopied("permissions");
                setTimeout(() => setCopied(null), 1000);
              }}
            >
              {copied === "permissions" ? "已复制" : "复制"}
            </button>
          </div>
          <pre style={{ margin: 0, overflow: "auto", maxHeight: 360 }}>{permissionsText}</pre>
        </div>
      </div>
    </div>
  );
}

