import React from "react";
import { Link } from "react-router-dom";
import { QUESTION_TYPES, useManagedQuestionsStore } from "./store";
import { ManagedQuestion, QuestionType } from "./types";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(items: ManagedQuestion[]) {
  const header = ["stage", "subject", "unit", "type", "stem", "createdAt"].join(",");
  const rows = items.map((q) =>
    [q.stage, q.subject, q.unit, q.type, q.stem, q.createdAt]
      .map((x) => `"${String(x).replaceAll("\"", "\"\"")}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function promptQuestion(defaults?: Partial<ManagedQuestion>) {
  const stage = prompt("学段", defaults?.stage ?? "初中");
  if (!stage?.trim()) return null;
  const subject = prompt("科目", defaults?.subject ?? "数学");
  if (!subject?.trim()) return null;
  const unit = prompt("单元", defaults?.unit ?? "第一单元");
  if (!unit?.trim()) return null;
  const typeRaw = prompt(
    "题型（SINGLE/MULTI/TF/FILL/SHORT）",
    (defaults?.type as string) ?? "SINGLE",
  );
  if (!typeRaw?.trim()) return null;
  const type = typeRaw.trim().toUpperCase() as QuestionType;
  if (!QUESTION_TYPES.some((t) => t.value === type)) {
    alert("题型不合法");
    return null;
  }
  const stem = prompt("题干", defaults?.stem ?? "");
  if (!stem?.trim()) return null;
  return {
    stage: stage.trim(),
    subject: subject.trim(),
    unit: unit.trim(),
    type,
    stem: stem.trim(),
  };
}

export function QuestionsPage() {
  const { state, actions } = useManagedQuestionsStore();
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return state.questions;
    return state.questions.filter((x) =>
      [x.stage, x.subject, x.unit, x.type, x.stem].join(" ").toLowerCase().includes(q),
    );
  }, [query, state.questions]);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button className="btn" onClick={actions.resetToSeed}>
            重置示例数据
          </button>
          <button
            className="btn"
            onClick={() => downloadText(`questions-${Date.now()}.csv`, toCsv(filtered))}
          >
            导出 CSV（占位）
          </button>
          <button
            className="btn primary"
            onClick={() => {
              const input = promptQuestion();
              if (!input) return;
              actions.create(input);
            }}
          >
            新增试题
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>试题管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：本地示例数据 + CRUD/筛选/导出；真实字段、题型枚举与批量导入/导出以 99-hub 定稿为准。
        </p>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="筛选：学段/科目/单元/题型/题干"
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
          filtered.map((q) => (
            <div key={q.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {q.id} · {q.stage}/{q.subject}/{q.unit} · {q.type}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{q.stem}</div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const input = promptQuestion(q);
                      if (!input) return;
                      actions.update(q.id, input);
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该试题？")) return;
                      actions.remove(q.id);
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

