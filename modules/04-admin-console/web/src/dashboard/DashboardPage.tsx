import { Link } from "react-router-dom";
import { useCmsStore } from "../cms/store";
import { useImportsStore } from "../imports/store";
import { useQuestionBankStore } from "../questionBank/store";
import { useSvipStore } from "../svip/store";

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 220 }}>
      <div className="muted" style={{ fontSize: 12 }}>
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>{value}</div>
      {hint ? (
        <div className="muted" style={{ marginTop: 6 }}>
          {hint}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardPage() {
  const qb = useQuestionBankStore();
  const imports = useImportsStore();
  const cms = useCmsStore();
  const svip = useSvipStore();

  const totalQuestions = qb.state.questions.length;
  const totalChapters = qb.state.chapters.length;
  const totalPackages = qb.state.packages.length;
  const totalSubjects = qb.state.subjects.length;

  const importTotal = imports.state.tasks.length;
  const importFailed = imports.state.tasks.filter((t) => t.status === "FAILED").length;
  const importDone = imports.state.tasks.filter((t) => t.status === "DONE").length;

  const annTotal = cms.state.announcements.length;
  const annPublished = cms.state.announcements.filter((a) => a.status === "PUBLISHED").length;

  const svipTotal = svip.state.codes.length;
  const svipActive = svip.state.codes.filter((c) => c.status === "ACTIVE").length;
  const svipRevoked = svip.state.codes.filter((c) => c.status === "REVOKED").length;

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <Link className="btn" to="/question-bank">
            题库管理
          </Link>
          <Link className="btn" to="/imports">
            导入管理
          </Link>
          <Link className="btn" to="/cms">
            公告管理
          </Link>
          <Link className="btn" to="/svip-codes">
            SVIP 码
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>数据看板（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为占位聚合：从本地 localStorage 的示例数据读取概览指标；真实活跃/正确率/完成率以 99-hub
          定稿接口为准。
        </p>
      </div>

      <div className="row" style={{ marginTop: 12 }}>
        <MetricCard title="题目数" value={`${totalQuestions}`} hint={`章节 ${totalChapters} · 题库包 ${totalPackages} · 科目 ${totalSubjects}`} />
        <MetricCard title="导入任务" value={`${importTotal}`} hint={`完成 ${importDone} · 失败 ${importFailed}`} />
        <MetricCard title="公告" value={`${annTotal}`} hint={`已发布 ${annPublished}`} />
        <MetricCard title="SVIP 码" value={`${svipTotal}`} hint={`可用 ${svipActive} · 已注销 ${svipRevoked}`} />
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>下一步（等契约定稿后补齐）</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          <li>活跃：DAU/WAU/MAU、留存等</li>
          <li>正确率：按科目/章节/题型聚合</li>
          <li>完成率：按题库包/课程进度聚合</li>
        </ul>
      </div>
    </div>
  );
}

