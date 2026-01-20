import React from "react";
import { Link, useParams } from "react-router-dom";
import { useImportsStore } from "./store";

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportTaskDetailPage() {
  const { taskId } = useParams();
  const { state, actions } = useImportsStore();
  const task = taskId ? actions.getTask(taskId) : undefined;
  const errors = taskId ? actions.getErrors(taskId) : [];

  const summary = React.useMemo(() => {
    if (!task) return "";
    return [
      `taskId=${task.id}`,
      `filename=${task.filename}`,
      `status=${task.status}`,
      `progress=${task.progress}`,
      `success=${task.success}`,
      `failed=${task.failed}`,
      `total=${task.total}`,
    ].join("\n");
  }, [task]);

  if (!taskId) {
    return (
      <div className="container">
        <div className="card">
          <p className="muted">缺少 taskId</p>
          <Link to="/imports">返回列表</Link>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container">
        <div className="card">
          <p className="muted">任务不存在：{taskId}</p>
          <Link to="/imports">返回列表</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="nav">
        <Link to="/imports">← 返回列表</Link>
        <div className="row">
          <button
            className="btn"
            onClick={() => downloadText(`import-${task.id}-summary.txt`, summary)}
          >
            下载摘要（占位）
          </button>
          <button
            className="btn primary"
            onClick={() => {
              const header = "row,message";
              const rows = errors.map((e) => `${e.row},\"${e.message.replaceAll("\"", "\"\"")}\"`);
              downloadText(`import-${task.id}-errors.csv`, [header, ...rows].join("\n"));
            }}
            disabled={errors.length === 0}
          >
            下载错误报告（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>任务详情</h2>
        <div className="muted" style={{ fontSize: 12 }}>
          {task.id}
        </div>
        <div style={{ fontWeight: 600 }}>{task.filename}</div>
        <p className="muted" style={{ marginTop: 6 }}>
          状态：{task.status} · 进度：{task.progress}% · 成功 {task.success}/
          {task.total} · 失败 {task.failed}
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>错误明细</h3>
        {errors.length === 0 ? (
          <p className="muted">无错误</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {errors.map((e) => (
              <div key={e.id} className="card" style={{ padding: 12 }}>
                <div className="muted" style={{ fontSize: 12 }}>
                  row {e.row}
                </div>
                <div>{e.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="muted">
        当前为占位实现：真实导入任务字段与错误报告格式以 99-hub 定稿为准。
      </p>
    </div>
  );
}

