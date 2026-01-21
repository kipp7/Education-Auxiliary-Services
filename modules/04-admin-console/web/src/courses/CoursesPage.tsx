import React from "react";
import { Link } from "react-router-dom";
import { useCoursesStore } from "./store";
import { CourseVideo } from "./types";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function CoursesPage() {
  const { state, actions } = useCoursesStore();
  const [q, setQ] = React.useState("");
  const [stage, setStage] = React.useState("ALL");
  const [grade, setGrade] = React.useState("ALL");
  const [subject, setSubject] = React.useState("ALL");
  const [unit, setUnit] = React.useState("ALL");

  const stages = React.useMemo(
    () => Array.from(new Set(state.videos.map((x) => x.stage))).sort(),
    [state.videos],
  );
  const grades = React.useMemo(
    () => Array.from(new Set(state.videos.map((x) => x.grade))).sort(),
    [state.videos],
  );
  const subjects = React.useMemo(
    () => Array.from(new Set(state.videos.map((x) => x.subject))).sort(),
    [state.videos],
  );
  const units = React.useMemo(() => Array.from(new Set(state.videos.map((x) => x.unit))).sort(), [state.videos]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return state.videos.filter((x) => {
      if (stage !== "ALL" && x.stage !== stage) return false;
      if (grade !== "ALL" && x.grade !== grade) return false;
      if (subject !== "ALL" && x.subject !== subject) return false;
      if (unit !== "ALL" && x.unit !== unit) return false;
      if (!query) return true;
      return x.title.toLowerCase().includes(query) || x.intro.toLowerCase().includes(query) || x.id.includes(query);
    });
  }, [q, stage, grade, subject, unit, state.videos]);

  const promptVideo = (base?: CourseVideo) => {
    const stage = prompt("学段", base?.stage ?? "小学");
    if (stage === null) return null;
    const grade = prompt("年级", base?.grade ?? "一年级");
    if (grade === null) return null;
    const subject = prompt("科目", base?.subject ?? "数学");
    if (subject === null) return null;
    const unit = prompt("单元", base?.unit ?? "单元 1");
    if (unit === null) return null;
    const title = prompt("标题", base?.title ?? "新课程");
    if (!title?.trim()) return null;
    const coverUrl = prompt("封面 URL（占位）", base?.coverUrl ?? "https://placehold.co/320x180") ?? "";
    const intro = prompt("简介（占位）", base?.intro ?? "") ?? "";
    const durationRaw = prompt("时长（秒）", String(base?.durationSeconds ?? 600));
    if (!durationRaw) return null;
    const durationSeconds = Number(durationRaw);
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      alert("时长需为正整数秒");
      return null;
    }
    return {
      stage,
      grade,
      subject,
      unit,
      title: title.trim(),
      coverUrl: coverUrl.trim(),
      intro: intro.trim(),
      durationSeconds: Math.floor(durationSeconds),
    };
  };

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
              const next = promptVideo();
              if (!next) return;
              actions.addVideo({ ...next, enabled: true });
            }}
          >
            新增课程（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>课程视频管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：按学段/年级/科目/单元关联，维护封面/标题/简介/时长；真实视频上传与播放地址以 99-hub 定稿为准。
        </p>
        <div className="row">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题/简介/ID" />
          <select className="input" style={{ width: 140 }} value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="ALL">学段：全部</option>
            {stages.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="input" style={{ width: 140 }} value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="ALL">年级：全部</option>
            {grades.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="input"
            style={{ width: 140 }}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            <option value="ALL">科目：全部</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select className="input" style={{ width: 160 }} value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="ALL">单元：全部</option>
            {units.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {filtered.length === 0 ? (
          <div className="card">
            <p className="muted" style={{ margin: 0 }}>
              无数据
            </p>
          </div>
        ) : (
          filtered.map((v) => (
            <div key={v.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {v.id} · {v.enabled ? "ON" : "OFF"} · {formatTime(v.updatedAt)}
                  </div>
                  <div style={{ fontWeight: 700 }}>{v.title}</div>
                  <div className="muted">
                    {v.stage}/{v.grade}/{v.subject}/{v.unit} · {formatDuration(v.durationSeconds)}
                  </div>
                  {v.intro ? (
                    <div className="muted" style={{ whiteSpace: "pre-wrap" }}>
                      {v.intro}
                    </div>
                  ) : null}
                  {v.coverUrl ? (
                    <div className="muted" style={{ fontSize: 12, wordBreak: "break-all" }}>
                      cover: {v.coverUrl}
                    </div>
                  ) : null}
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button className="btn" onClick={() => actions.updateVideo(v.id, { enabled: !v.enabled })}>
                    {v.enabled ? "下线" : "上线"}
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      const next = promptVideo(v);
                      if (!next) return;
                      actions.updateVideo(v.id, next);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该课程？")) return;
                      actions.removeVideo(v.id);
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

