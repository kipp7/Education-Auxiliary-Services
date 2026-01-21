import React from "react";
import { Link } from "react-router-dom";
import { useBannersStore } from "./store";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

export function BannersPage() {
  const { state, actions } = useBannersStore();

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
              const title = prompt("标题", "新 Banner");
              if (title === null) return;
              const imageUrl = prompt("图片 URL（占位）", "https://placehold.co/800x360") ?? "";
              const linkUrl = prompt("跳转链接（占位）", "https://example.com") ?? "";
              actions.createBanner({ title, imageUrl, linkUrl });
            }}
          >
            新增 Banner（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>轮播图管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：URL 代替上传、支持排序/跳转链接/开关/间隔；真实上传与素材管理以 99-hub 定稿为准。
        </p>
        <div className="row">
          <label className="muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            全局开关
            <input
              type="checkbox"
              checked={state.config.enabled}
              onChange={(e) => actions.setConfig({ enabled: e.target.checked })}
            />
          </label>
          <label className="muted" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            间隔（秒）
            <input
              className="input"
              style={{ width: 120 }}
              type="number"
              min={1}
              max={60}
              value={state.config.intervalSeconds}
              onChange={(e) => actions.setConfig({ intervalSeconds: Number(e.target.value) })}
            />
          </label>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {state.banners.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              无数据
            </p>
          </div>
        ) : (
          state.banners.map((b, idx) => (
            <div key={b.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {b.id} · sort:{b.sort} · {b.enabled ? "ON" : "OFF"} · {formatTime(b.updatedAt)}
                  </div>
                  <div style={{ fontWeight: 700 }}>{b.title}</div>
                  <div className="muted" style={{ fontSize: 12, wordBreak: "break-all" }}>
                    image: {b.imageUrl || "-"}
                  </div>
                  <div className="muted" style={{ fontSize: 12, wordBreak: "break-all" }}>
                    link: {b.linkUrl || "-"}
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button className="btn" disabled={idx === 0} onClick={() => actions.move(b.id, "up")}>
                    上移
                  </button>
                  <button
                    className="btn"
                    disabled={idx === state.banners.length - 1}
                    onClick={() => actions.move(b.id, "down")}
                  >
                    下移
                  </button>
                  <button className="btn" onClick={() => actions.updateBanner(b.id, { enabled: !b.enabled })}>
                    {b.enabled ? "关闭" : "开启"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      const title = prompt("标题", b.title);
                      if (title === null) return;
                      const imageUrl = prompt("图片 URL（占位）", b.imageUrl) ?? "";
                      const linkUrl = prompt("跳转链接（占位）", b.linkUrl) ?? "";
                      actions.updateBanner(b.id, { title, imageUrl, linkUrl });
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该 Banner？")) return;
                      actions.removeBanner(b.id);
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

