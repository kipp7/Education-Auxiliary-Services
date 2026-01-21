import React from "react";
import { Link } from "react-router-dom";
import { useBannerStore } from "./store";

export function BannersPage() {
  const { state, actions } = useBannerStore();
  const [interval, setInterval] = React.useState(String(state.intervalSeconds));

  React.useEffect(() => {
    setInterval(String(state.intervalSeconds));
  }, [state.intervalSeconds]);

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
              const imageUrl = prompt("图片 URL", "https://picsum.photos/seed/new/960/360");
              if (!imageUrl?.trim()) return;
              const linkUrl = prompt("跳转链接", "https://example.com") ?? "";
              actions.addBanner(imageUrl.trim(), linkUrl.trim());
            }}
          >
            新增轮播
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>轮播图管理</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例数据 + 排序/开关/链接/间隔；真实上传与小程序展示契约以 99-hub 定稿为准。
        </p>

        <div className="row" style={{ alignItems: "flex-end" }}>
          <label style={{ flex: 1, minWidth: 220 }}>
            间隔（秒）
            <input
              className="input"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              placeholder="例如 4"
              style={{ marginTop: 6 }}
            />
          </label>
          <button
            className="btn"
            onClick={() => {
              const next = Number(interval);
              if (!Number.isFinite(next) || next <= 0 || next > 60) {
                alert("间隔需为 1~60 秒");
                return;
              }
              actions.setIntervalSeconds(next);
            }}
          >
            保存间隔
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {state.items.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              无轮播项
            </p>
          </div>
        ) : (
          state.items.map((b, idx) => (
            <div key={b.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {idx + 1}. {b.id} · {b.enabled ? "启用" : "停用"}
                  </div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <img
                      src={b.imageUrl}
                      alt={b.id}
                      style={{ width: 240, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid #e2e8f0" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ wordBreak: "break-all" }}>
                        <div className="muted" style={{ fontSize: 12 }}>
                          imageUrl
                        </div>
                        {b.imageUrl}
                      </div>
                      <div style={{ wordBreak: "break-all", marginTop: 8 }}>
                        <div className="muted" style={{ fontSize: 12 }}>
                          linkUrl
                        </div>
                        {b.linkUrl || <span className="muted">（无）</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button className="btn" onClick={() => actions.move(b.id, "up")} disabled={idx === 0}>
                    上移
                  </button>
                  <button
                    className="btn"
                    onClick={() => actions.move(b.id, "down")}
                    disabled={idx === state.items.length - 1}
                  >
                    下移
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      const nextImage = prompt("编辑图片 URL", b.imageUrl);
                      if (!nextImage?.trim()) return;
                      const nextLink = prompt("编辑跳转链接", b.linkUrl) ?? "";
                      actions.updateBanner(b.id, {
                        imageUrl: nextImage.trim(),
                        linkUrl: nextLink.trim(),
                      });
                    }}
                  >
                    编辑
                  </button>
                  <button className="btn" onClick={() => actions.updateBanner(b.id, { enabled: !b.enabled })}>
                    {b.enabled ? "停用" : "启用"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该轮播项？")) return;
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

