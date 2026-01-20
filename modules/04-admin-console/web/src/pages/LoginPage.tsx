import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export function LoginPage() {
  const { loginDev } = useAuth();
  const [displayName, setDisplayName] = React.useState("");
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
        <h2 style={{ marginTop: 0 }}>管理员登录</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为开发占位登录；鉴权与权限点以 99-hub 定稿为准。
        </p>

        <label>
          显示名称
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例如：管理员"
            style={{ marginTop: 6 }}
          />
        </label>

        <div className="row" style={{ marginTop: 14 }}>
          <button
            className="btn primary"
            onClick={() => {
              loginDev(displayName);
              navigate("/", { replace: true });
            }}
          >
            开发登录
          </button>
        </div>
      </div>
    </div>
  );
}

