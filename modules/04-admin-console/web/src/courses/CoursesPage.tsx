import React from "react";
import { Link } from "react-router-dom";
import { useCoursesStore } from "./store";
import { Course } from "./types";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function promptCourse(defaults?: Partial<Course>) {
  const stage = prompt("学段", defaults?.stage ?? "初中");
  if (!stage?.trim()) return null;
  const grade = prompt("年级", defaults?.grade ?? "七年级");
  if (!grade?.trim()) return null;
  const subject = prompt("科目", defaults?.subject ?? "数学");
  if (!subject?.trim()) return null;
  const unit = prompt("单元", defaults?.unit ?? "第一单元");
  if (!unit?.trim()) return null;
  const coverUrl = prompt(
    "封面 URL",
    defaults?.coverUrl ?? "https://picsum.photos/seed/newcourse/320/180",
  );
  if (!coverUrl?.trim()) return null;
  const title = prompt("标题", defaults?.title ?? "");
  if (!title?.trim()) return null;
  const description = prompt("简介", defaults?.description ?? "") ?? "";
  const durationRaw = prompt("时长（秒）", String(defaults?.durationSeconds ?? 600));
  if (!durationRaw?.trim()) return null;
  const durationSeconds = Number(durationRaw);
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    alert("时长需为正整数（秒）");
    return null;
  }
  return {
    stage: stage.trim(),
    grade: grade.trim(),
    subject: subject.trim(),
    unit: unit.trim(),
    coverUrl: coverUrl.trim(),
    title: title.trim(),
    description: description.trim(),
    durationSeconds,
  };
}

export function CoursesPage() {
  const { state, actions } = useCoursesStore();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.courses;
    return state.courses.filter((c) =>
      [c.stage, c.grade, c.subject, c.unit, c.title, c.description]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query, state.courses]);

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
              const input = promptCourse();
              if (!input) return;
              actions.createCourse(input);
            }}
          >
            新增课程
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>课程视频管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例数据 + CRUD；真实视频资源与枚举以 99-hub 定稿为准。
        </p>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="筛选：学段/年级/科目/单元/标题"
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
          filtered.map((c) => (
            <div key={c.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {c.id} · {c.stage}/{c.grade}/{c.subject}/{c.unit} ·{" "}
                    {formatDuration(c.durationSeconds)}
                  </div>
                  <div className="row" style={{ marginTop: 8 }}>
                    <img
                      src={c.coverUrl}
                      alt={c.id}
                      style={{
                        width: 160,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 220 }}>
                      <div style={{ fontWeight: 700 }}>{c.title}</div>
                      <div className="muted" style={{ whiteSpace: "pre-wrap" }}>
                        {c.description || "（无简介）"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const input = promptCourse(c);
                      if (!input) return;
                      actions.updateCourse(c.id, input);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该课程？")) return;
                      actions.deleteCourse(c.id);
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

