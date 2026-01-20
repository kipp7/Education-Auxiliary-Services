import React from "react";
import { Link } from "react-router-dom";
import { useCmsStore } from "./store";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function AnnouncementsPage() {
  const { state, actions } = useCmsStore();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.announcements;
    return state.announcements.filter(
      (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    );
  }, [query, state.announcements]);

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
              const title = prompt("公告标题");
              if (!title?.trim()) return;
              const body = prompt("公告内容") ?? "";
              actions.createAnnouncement(title.trim(), body.trim());
            }}
          >
            新增公告
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>资讯 / 公告管理</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例数据 + 草稿/发布切换；真实接口与字段以 99-hub 定稿为准。
        </p>

        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索标题/内容"
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
          filtered.map((a) => (
            <div key={a.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {a.id} · {a.status} · {formatTime(a.updatedAt)}
                  </div>
                  <div style={{ fontWeight: 700 }}>{a.title}</div>
                  <div className="muted" style={{ whiteSpace: "pre-wrap" }}>
                    {a.body}
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const nextTitle = prompt("编辑标题", a.title);
                      if (!nextTitle?.trim()) return;
                      const nextBody = prompt("编辑内容", a.body) ?? "";
                      actions.updateAnnouncement(a.id, {
                        title: nextTitle.trim(),
                        body: nextBody.trim(),
                      });
                    }}
                  >
                    编辑
                  </button>
                  {a.status === "DRAFT" ? (
                    <button
                      className="btn primary"
                      onClick={() => actions.setStatus(a.id, "PUBLISHED")}
                    >
                      发布
                    </button>
                  ) : (
                    <button
                      className="btn"
                      onClick={() => actions.setStatus(a.id, "DRAFT")}
                    >
                      下线
                    </button>
                  )}
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该公告？")) return;
                      actions.deleteAnnouncement(a.id);
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

