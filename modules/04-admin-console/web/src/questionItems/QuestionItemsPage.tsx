import React from "react";
import { Link } from "react-router-dom";
import { useQuestionItemsStore } from "./store";
import { QuestionItem, QuestionItemType } from "./types";

function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(v: string) {
  return `"${v.replaceAll("\"", "\"\"")}"`;
}

function toCsv(items: QuestionItem[]) {
  const header = ["stage", "subject", "unit", "type", "stem", "answer"].join(",");
  const rows = items.map((x) =>
    [x.stage, x.subject, x.unit, x.type, x.stem, x.answer].map((v) => csvEscape(String(v ?? ""))).join(","),
  );
  return [header, ...rows].join("\n");
}

function parseCsv(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const header = lines[0].split(",").map((s) => s.trim().replaceAll(/^\"|\"$/g, ""));
  const idx = (name: string) => header.findIndex((h) => h === name);
  const iStage = idx("stage");
  const iSubject = idx("subject");
  const iUnit = idx("unit");
  const iType = idx("type");
  const iStem = idx("stem");
  const iAnswer = idx("answer");
  if ([iStage, iSubject, iUnit, iType, iStem, iAnswer].some((i) => i < 0)) {
    throw new Error("CSV 头需要包含：stage,subject,unit,type,stem,answer");
  }

  const parseLine = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === "\"") {
          if (line[i + 1] === "\"") {
            cur += "\"";
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cur += ch;
        }
      } else {
        if (ch === ",") {
          out.push(cur);
          cur = "";
        } else if (ch === "\"") {
          inQuotes = true;
        } else {
          cur += ch;
        }
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };

  return lines.slice(1).map((l) => parseLine(l));
}

const typeOptions: { value: QuestionItemType; label: string }[] = [
  { value: "SINGLE", label: "单选" },
  { value: "MULTI", label: "多选" },
  { value: "JUDGE", label: "判断" },
  { value: "FILL", label: "填空" },
  { value: "SHORT", label: "简答" },
];

export function QuestionItemsPage() {
  const { state, actions } = useQuestionItemsStore();
  const [q, setQ] = React.useState("");
  const [stage, setStage] = React.useState<string>("ALL");
  const [subject, setSubject] = React.useState<string>("ALL");
  const [unit, setUnit] = React.useState<string>("ALL");
  const [type, setType] = React.useState<QuestionItemType | "ALL">("ALL");

  const stages = React.useMemo(() => Array.from(new Set(state.items.map((x) => x.stage))).sort(), [state.items]);
  const subjects = React.useMemo(
    () => Array.from(new Set(state.items.map((x) => x.subject))).sort(),
    [state.items],
  );
  const units = React.useMemo(() => Array.from(new Set(state.items.map((x) => x.unit))).sort(), [state.items]);

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    return state.items.filter((x) => {
      if (stage !== "ALL" && x.stage !== stage) return false;
      if (subject !== "ALL" && x.subject !== subject) return false;
      if (unit !== "ALL" && x.unit !== unit) return false;
      if (type !== "ALL" && x.type !== type) return false;
      if (!query) return true;
      return (
        x.stem.toLowerCase().includes(query) ||
        x.answer.toLowerCase().includes(query) ||
        x.id.includes(query)
      );
    });
  }, [q, stage, subject, unit, type, state.items]);

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
            onClick={() =>
              downloadText(`question-items-${Date.now()}.csv`, toCsv(filtered), "text/csv;charset=utf-8")
            }
          >
            导出 CSV（占位）
          </button>
          <label className="btn" style={{ position: "relative", overflow: "hidden" }}>
            批量导入 CSV（占位）
            <input
              type="file"
              accept=".csv,text/csv"
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                const text = await file.text();
                try {
                  const rows = parseCsv(text);
                  const items = rows.map((r) => ({
                    stage: r[0] ?? "",
                    subject: r[1] ?? "",
                    unit: r[2] ?? "",
                    type: (r[3] as QuestionItemType) ?? "SINGLE",
                    stem: r[4] ?? "",
                    answer: r[5] ?? "",
                  }));
                  actions.importMany(items);
                  alert(`已导入 ${items.length} 条（占位）`);
                } catch (err) {
                  alert((err as Error).message);
                }
              }}
            />
          </label>
          <button
            className="btn primary"
            onClick={() => {
              const stage = prompt("学段", "小学");
              if (stage === null) return;
              const subject = prompt("科目", "数学");
              if (subject === null) return;
              const unit = prompt("单元", "单元 1");
              if (unit === null) return;
              const type = (prompt("题型（SINGLE/MULTI/JUDGE/FILL/SHORT）", "SINGLE") ?? "SINGLE")
                .trim()
                .toUpperCase() as QuestionItemType;
              const stem = prompt("题干", "题干（占位）");
              if (!stem?.trim()) return;
              const answer = prompt("答案（占位）", "") ?? "";
              actions.addItem({ stage, subject, unit, type, stem, answer });
            }}
          >
            新增试题（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>试题管理（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位实现：按学段/科目/单元/题型归档 + CSV 批量导入/导出（本地 localStorage）。
        </p>
        <div className="row">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索题干/答案/ID" />
          <select className="input" style={{ width: 140 }} value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="ALL">学段：全部</option>
            {stages.map((s) => (
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
          <select
            className="input"
            style={{ width: 140 }}
            value={type}
            onChange={(e) => setType(e.target.value as QuestionItemType | "ALL")}
          >
            <option value="ALL">题型：全部</option>
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
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
          filtered.map((x) => (
            <div key={x.id} className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {x.id} · {x.stage}/{x.subject}/{x.unit} · {x.type}
                  </div>
                  <div style={{ fontWeight: 700, whiteSpace: "pre-wrap" }}>{x.stem}</div>
                  <div className="muted" style={{ whiteSpace: "pre-wrap" }}>
                    answer: {x.answer || "-"}
                  </div>
                </div>
                <div className="row" style={{ alignItems: "flex-start" }}>
                  <button
                    className="btn"
                    onClick={() => {
                      const stage = prompt("学段", x.stage);
                      if (stage === null) return;
                      const subject = prompt("科目", x.subject);
                      if (subject === null) return;
                      const unit = prompt("单元", x.unit);
                      if (unit === null) return;
                      const type = (prompt("题型（SINGLE/MULTI/JUDGE/FILL/SHORT）", x.type) ?? x.type)
                        .trim()
                        .toUpperCase() as QuestionItemType;
                      const stem = prompt("题干", x.stem);
                      if (!stem?.trim()) return;
                      const answer = prompt("答案（占位）", x.answer) ?? "";
                      actions.updateItem(x.id, { stage, subject, unit, type, stem, answer });
                    }}
                  >
                    编辑
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      if (!confirm("确认删除该试题？")) return;
                      actions.removeItem(x.id);
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
