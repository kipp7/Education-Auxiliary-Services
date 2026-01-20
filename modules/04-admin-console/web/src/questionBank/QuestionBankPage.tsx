import React from "react";
import { Link } from "react-router-dom";
import { useQuestionBankStore } from "./store";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      {children}
    </div>
  );
}

export function QuestionBankPage() {
  const { state, actions } = useQuestionBankStore();
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(
    () => state.subjects[0]?.id ?? null,
  );
  const packages = state.packages.filter((p) => p.subjectId === selectedSubjectId);
  const [selectedPackageId, setSelectedPackageId] = React.useState<string | null>(
    () => packages[0]?.id ?? null,
  );
  const chapters = state.chapters.filter((c) => c.packageId === selectedPackageId);
  const [selectedChapterId, setSelectedChapterId] = React.useState<string | null>(
    () => chapters[0]?.id ?? null,
  );
  const questions = state.questions.filter((q) => q.chapterId === selectedChapterId);

  React.useEffect(() => {
    if (selectedSubjectId && !state.subjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(state.subjects[0]?.id ?? null);
    }
  }, [selectedSubjectId, state.subjects]);

  React.useEffect(() => {
    const next = state.packages.filter((p) => p.subjectId === selectedSubjectId)[0]?.id ?? null;
    if (selectedPackageId && !state.packages.some((p) => p.id === selectedPackageId)) {
      setSelectedPackageId(next);
    }
    if (!selectedPackageId && next) setSelectedPackageId(next);
  }, [selectedPackageId, selectedSubjectId, state.packages]);

  React.useEffect(() => {
    const next = state.chapters.filter((c) => c.packageId === selectedPackageId)[0]?.id ?? null;
    if (selectedChapterId && !state.chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(next);
    }
    if (!selectedChapterId && next) setSelectedChapterId(next);
  }, [selectedChapterId, selectedPackageId, state.chapters]);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button className="btn" onClick={actions.resetToSeed}>
            重置示例数据
          </button>
        </div>
      </div>

      <Section title="科目">
        <div className="row" style={{ marginBottom: 10 }}>
          <button
            className="btn primary"
            onClick={() => {
              const name = prompt("科目名称");
              if (!name?.trim()) return;
              actions.addSubject(name.trim());
            }}
          >
            新增科目
          </button>
        </div>
        <div className="row">
          {state.subjects.map((s) => (
            <button
              key={s.id}
              className={`btn ${s.id === selectedSubjectId ? "primary" : ""}`}
              onClick={() => setSelectedSubjectId(s.id)}
              title={s.id}
            >
              {s.name}
            </button>
          ))}
        </div>
        {selectedSubjectId && (
          <div className="row" style={{ marginTop: 10 }}>
            <button
              className="btn"
              onClick={() => {
                const subject = state.subjects.find((s) => s.id === selectedSubjectId);
                const nextName = prompt("重命名科目", subject?.name ?? "");
                if (!nextName?.trim()) return;
                actions.renameSubject(selectedSubjectId, nextName.trim());
              }}
            >
              重命名
            </button>
            <button
              className="btn"
              onClick={() => {
                if (!confirm("删除该科目将级联删除其题库包/章节/题目，是否继续？")) return;
                actions.deleteSubject(selectedSubjectId);
              }}
            >
              删除
            </button>
          </div>
        )}
      </Section>

      <Section title="题库包">
        {!selectedSubjectId ? (
          <p className="muted">请选择科目</p>
        ) : (
          <>
            <div className="row" style={{ marginBottom: 10 }}>
              <button
                className="btn primary"
                onClick={() => {
                  const name = prompt("题库包名称");
                  if (!name?.trim()) return;
                  actions.addPackage(selectedSubjectId, name.trim());
                }}
              >
                新增题库包
              </button>
            </div>
            <div className="row">
              {packages.map((p) => (
                <button
                  key={p.id}
                  className={`btn ${p.id === selectedPackageId ? "primary" : ""}`}
                  onClick={() => setSelectedPackageId(p.id)}
                  title={p.id}
                >
                  {p.name}
                </button>
              ))}
            </div>
            {selectedPackageId && (
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className="btn"
                  onClick={() => {
                    const pkg = state.packages.find((p) => p.id === selectedPackageId);
                    const nextName = prompt("重命名题库包", pkg?.name ?? "");
                    if (!nextName?.trim()) return;
                    actions.renamePackage(selectedPackageId, nextName.trim());
                  }}
                >
                  重命名
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    if (!confirm("删除该题库包将级联删除其章节/题目，是否继续？")) return;
                    actions.deletePackage(selectedPackageId);
                  }}
                >
                  删除
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="章节">
        {!selectedPackageId ? (
          <p className="muted">请选择题库包</p>
        ) : (
          <>
            <div className="row" style={{ marginBottom: 10 }}>
              <button
                className="btn primary"
                onClick={() => {
                  const name = prompt("章节名称");
                  if (!name?.trim()) return;
                  actions.addChapter(selectedPackageId, name.trim());
                }}
              >
                新增章节
              </button>
            </div>
            <div className="row">
              {chapters.map((c) => (
                <button
                  key={c.id}
                  className={`btn ${c.id === selectedChapterId ? "primary" : ""}`}
                  onClick={() => setSelectedChapterId(c.id)}
                  title={c.id}
                >
                  {c.name}
                </button>
              ))}
            </div>
            {selectedChapterId && (
              <div className="row" style={{ marginTop: 10 }}>
                <button
                  className="btn"
                  onClick={() => {
                    const chapter = state.chapters.find((c) => c.id === selectedChapterId);
                    const nextName = prompt("重命名章节", chapter?.name ?? "");
                    if (!nextName?.trim()) return;
                    actions.renameChapter(selectedChapterId, nextName.trim());
                  }}
                >
                  重命名
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    if (!confirm("删除该章节将删除其题目，是否继续？")) return;
                    actions.deleteChapter(selectedChapterId);
                  }}
                >
                  删除
                </button>
              </div>
            )}
          </>
        )}
      </Section>

      <Section title="题目列表">
        {!selectedChapterId ? (
          <p className="muted">请选择章节</p>
        ) : (
          <>
            <div className="row" style={{ marginBottom: 10 }}>
              <button
                className="btn primary"
                onClick={() => {
                  const stem = prompt("题干");
                  if (!stem?.trim()) return;
                  actions.addQuestion(selectedChapterId, stem.trim());
                }}
              >
                新增题目
              </button>
            </div>
            {questions.length === 0 ? (
              <p className="muted">暂无题目</p>
            ) : (
              <div className="row" style={{ flexDirection: "column" }}>
                {questions.map((q) => (
                  <div key={q.id} className="card" style={{ padding: 12 }}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontSize: 12 }} className="muted">
                          {q.id}
                        </div>
                        <div>{q.stem}</div>
                      </div>
                      <div className="row">
                        <button
                          className="btn"
                          onClick={() => {
                            const nextStem = prompt("编辑题干", q.stem);
                            if (!nextStem?.trim()) return;
                            actions.updateQuestion(q.id, nextStem.trim());
                          }}
                        >
                          编辑
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            if (!confirm("确认删除该题目？")) return;
                            actions.deleteQuestion(q.id);
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Section>

      <p className="muted">
        当前为本地示例数据与占位 CRUD；接入真实 API 前请以 99-hub 定稿契约为准。
      </p>
    </div>
  );
}

