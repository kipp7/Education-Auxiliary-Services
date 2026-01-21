import React from "react";
import { Link } from "react-router-dom";
import { useHomeSlotsStore } from "./store";
import { HomeSlotItem, HomeSlotsConfig } from "./types";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function downloadJson(filename: string, payload: unknown) {
  const text = JSON.stringify(payload, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function SlotList({
  title,
  items,
  onAdd,
  onEdit,
  onRemove,
}: {
  title: string;
  items: HomeSlotItem[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <button className="btn" onClick={onAdd}>
          新增
        </button>
      </div>
      {items.length === 0 ? (
        <p className="muted" style={{ marginBottom: 0 }}>
          暂无数据
        </p>
      ) : (
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {items.map((x) => (
            <div key={x.id} className="row" style={{ justifyContent: "space-between" }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ fontWeight: 700 }}>{x.title}</div>
                {x.tag ? (
                  <div className="muted" style={{ fontSize: 12 }}>
                    {x.tag}
                  </div>
                ) : null}
              </div>
              <div className="row">
                <button className="btn" onClick={() => onEdit(x.id)}>
                  编辑
                </button>
                <button className="btn" onClick={() => onRemove(x.id)}>
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function HomeSlotsPage() {
  const { state, actions } = useHomeSlotsStore();

  const exportPayload = React.useMemo(() => {
    const payload: HomeSlotsConfig = {
      banners: state.banners,
      recommendedQuestionBanks: state.recommendedQuestionBanks,
      recommendedCourses: state.recommendedCourses,
      recommendedPlans: state.recommendedPlans,
      updatedAt: state.updatedAt,
    };
    return payload;
  }, [state]);

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
            onClick={() => downloadJson(`home-slots-${Date.now()}.json`, exportPayload)}
          >
            导出 JSON（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>首页运营位配置（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：banner / 推荐题库 / 推荐课程 / 推荐套餐；用于小程序首页“配置驱动”的 Mock 联调。
        </p>
        <div className="muted" style={{ fontSize: 12 }}>
          updatedAt: {formatTime(state.updatedAt)}
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <SlotList
          title="Banner（占位）"
          items={state.banners}
          onAdd={() => {
            const title = prompt("标题", "新 Banner");
            if (title === null) return;
            const tag = prompt("跳转/标签（可选）", "link:/pages/index/index") ?? "";
            actions.addItem("banners", title, tag);
          }}
          onEdit={(id) => {
            const item = state.banners.find((x) => x.id === id);
            if (!item) return;
            const title = prompt("标题", item.title);
            if (title === null) return;
            const tag = prompt("跳转/标签（可选）", item.tag ?? "") ?? "";
            actions.updateItem("banners", id, { title, tag: tag.trim() || undefined });
          }}
          onRemove={(id) => {
            if (!confirm("确认删除？")) return;
            actions.removeItem("banners", id);
          }}
        />

        <SlotList
          title="推荐题库（占位）"
          items={state.recommendedQuestionBanks}
          onAdd={() => {
            const title = prompt("题库名称", "推荐题库");
            if (title === null) return;
            actions.addItem("recommendedQuestionBanks", title);
          }}
          onEdit={(id) => {
            const item = state.recommendedQuestionBanks.find((x) => x.id === id);
            if (!item) return;
            const title = prompt("题库名称", item.title);
            if (title === null) return;
            actions.updateItem("recommendedQuestionBanks", id, { title });
          }}
          onRemove={(id) => {
            if (!confirm("确认删除？")) return;
            actions.removeItem("recommendedQuestionBanks", id);
          }}
        />

        <SlotList
          title="推荐课程（占位）"
          items={state.recommendedCourses}
          onAdd={() => {
            const title = prompt("课程名称", "推荐课程");
            if (title === null) return;
            actions.addItem("recommendedCourses", title);
          }}
          onEdit={(id) => {
            const item = state.recommendedCourses.find((x) => x.id === id);
            if (!item) return;
            const title = prompt("课程名称", item.title);
            if (title === null) return;
            actions.updateItem("recommendedCourses", id, { title });
          }}
          onRemove={(id) => {
            if (!confirm("确认删除？")) return;
            actions.removeItem("recommendedCourses", id);
          }}
        />

        <SlotList
          title="推荐套餐（占位）"
          items={state.recommendedPlans}
          onAdd={() => {
            const title = prompt("套餐名称", "推荐套餐");
            if (title === null) return;
            actions.addItem("recommendedPlans", title);
          }}
          onEdit={(id) => {
            const item = state.recommendedPlans.find((x) => x.id === id);
            if (!item) return;
            const title = prompt("套餐名称", item.title);
            if (title === null) return;
            actions.updateItem("recommendedPlans", id, { title });
          }}
          onRemove={(id) => {
            if (!confirm("确认删除？")) return;
            actions.removeItem("recommendedPlans", id);
          }}
        />
      </div>
    </div>
  );
}

