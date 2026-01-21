import React from "react";
import { Link, useParams } from "react-router-dom";
import { useCmsStore } from "./store";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function AnnouncementDetailPage() {
  const { state, actions } = useCmsStore();
  const { id } = useParams<{ id: string }>();
  const ann = state.announcements.find((a) => a.id === id);

  if (!ann) {
    return (
      <div className="container">
        <div className="nav">
          <Link to="/cms">← 返回</Link>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>公告详情</h2>
          <p className="muted" style={{ margin: 0 }}>
            未找到该公告
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav">
        <Link to="/cms">← 返回</Link>
        <div className="row">
          <button
            className="btn"
            onClick={() => actions.togglePinned(ann.id)}
            title="置顶：仅占位字段"
          >
            {ann.pinned ? "取消置顶" : "置顶"}
          </button>
          <button
            className="btn"
            onClick={() => {
              const nextTitle = prompt("编辑标题", ann.title);
              if (!nextTitle?.trim()) return;
              const nextBody = prompt("编辑内容", ann.body) ?? "";
              actions.updateAnnouncement(ann.id, {
                title: nextTitle.trim(),
                body: nextBody.trim(),
              });
            }}
          >
            编辑
          </button>
          {ann.status === "DRAFT" ? (
            <button className="btn primary" onClick={() => actions.setStatus(ann.id, "PUBLISHED")}>
              发布
            </button>
          ) : (
            <button className="btn" onClick={() => actions.setStatus(ann.id, "DRAFT")}>
              下线
            </button>
          )}
          <button
            className="btn"
            onClick={() => {
              if (!confirm("确认删除该公告？")) return;
              actions.deleteAnnouncement(ann.id);
              location.href = "/cms";
            }}
          >
            删除
          </button>
        </div>
      </div>

      <div className="card">
        <div className="muted" style={{ fontSize: 12 }}>
          {ann.id} · {ann.status}
          {ann.pinned ? " · PINNED" : ""} · createdAt {formatTime(ann.createdAt)} · updatedAt{" "}
          {formatTime(ann.updatedAt)}
        </div>
        <h2 style={{ marginTop: 8 }}>{ann.title}</h2>
        <div style={{ whiteSpace: "pre-wrap" }}>{ann.body}</div>
      </div>
    </div>
  );
}

