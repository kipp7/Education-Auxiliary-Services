import React from "react";
import { Link } from "react-router-dom";
import { useCmsStore } from "../cms/store";
import { useQuestionBankStore } from "../questionBank/store";

function downloadJson(filename: string, data: unknown) {
  const text = JSON.stringify(data, null, 2);
  const blob = new Blob([text], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportsPage() {
  const qb = useQuestionBankStore();
  const cms = useCmsStore();

  const config = React.useMemo(() => {
    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      banners: [] as Array<{
        imageUrl: string;
        linkUrl: string;
        enabled: boolean;
        sort: number;
      }>,
      questionBank: {
        subjects: qb.state.subjects,
        packages: qb.state.packages,
        chapters: qb.state.chapters,
        questions: qb.state.questions,
      },
      courses: [] as Array<{
        stage: string;
        grade: string;
        subject: string;
        unit: string;
        title: string;
        coverUrl: string;
        durationSeconds: number;
      }>,
      announcements: cms.state.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        status: a.status,
        updatedAt: a.updatedAt,
      })),
    };
  }, [cms.state.announcements, qb.state.chapters, qb.state.packages, qb.state.questions, qb.state.subjects]);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button className="btn primary" onClick={() => downloadJson("admin-config.json", config)}>
            导出 admin-config.json
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>配置导出（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为 M5 占位：导出一份 JSON 供小程序 Mock 读取；轮播/课程部分若未实现会导出为空数组。
        </p>
        <pre style={{ margin: 0, overflow: "auto", maxHeight: 360 }}>
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

