import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { RequirePermission } from "../auth/RequirePermission";

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="container">
      <div className="nav">
        <div>
          <strong>Admin Console</strong>
        </div>
        <div className="row" style={{ alignItems: "center" }}>
          <span className="muted">你好，{user?.displayName}</span>
          <button className="btn" onClick={logout}>
            退出
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>入口</h3>
        <RequirePermission permission="admin:access">
          <div className="row">
            <Link className="btn" to="/exports">
              配置导出（占位）
            </Link>
            <Link className="btn" to="/exports-ops">
              运营配置导出（占位）
            </Link>
            <Link className="btn" to="/svip-codes">
              SVIP 码管理（占位）
            </Link>
            <Link className="btn" to="/question-bank">
              题库管理（占位）
            </Link>
            <Link className="btn" to="/question-items">
              试题管理（占位）
            </Link>
            <Link className="btn" to="/banners">
              轮播图管理（占位）
            </Link>
            <Link className="btn" to="/courses">
              课程视频管理（占位）
            </Link>
            <Link className="btn" to="/imports">
              导入管理（占位）
            </Link>
            <Link className="btn" to="/cms">
              公告管理（占位）
            </Link>
            <Link className="btn" to="/home-slots">
              首页运营位配置（占位）
            </Link>
            <Link className="btn" to="/dashboard">
              数据看板（占位）
            </Link>
            <Link className="btn" to="/plans">
              套餐管理（占位）
            </Link>
            <Link className="btn" to="/orders">
              订单管理（占位）
            </Link>
          </div>
          <p className="muted" style={{ marginBottom: 0 }}>
            后续按 `TASKS.md` 逐步补齐页面与接口联调。
          </p>
        </RequirePermission>
      </div>
    </div>
  );
}

