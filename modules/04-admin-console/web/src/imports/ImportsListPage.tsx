import { Link, useNavigate } from "react-router-dom";
import { useImportsStore } from "./store";

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
}

function statusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "排队中";
    case "RUNNING":
      return "进行中";
    case "DONE":
      return "已完成";
    case "FAILED":
      return "失败";
    default:
      return status;
  }
}

export function ImportsListPage() {
  const { state, actions } = useImportsStore();
  const navigate = useNavigate();

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
              const filename = prompt("上传文件名（示例）", "import.xlsx");
              if (!filename?.trim()) return;
              actions.createUploadTask(filename.trim());
            }}
          >
            上传（占位）
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>导入任务</h2>
        {state.tasks.length === 0 ? (
          <p className="muted">暂无任务</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {state.tasks.map((t) => (
              <div key={t.id} className="card" style={{ padding: 12 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ fontSize: 12 }} className="muted">
                      {t.id} · {formatTime(t.createdAt)}
                    </div>
                    <div style={{ fontWeight: 600 }}>{t.filename}</div>
                    <div className="muted">
                      {statusLabel(t.status)} · {t.progress}% · 成功 {t.success}/
                      {t.total} · 失败 {t.failed}
                    </div>
                  </div>
                  <div className="row">
                    <button
                      className="btn"
                      onClick={() => navigate(`/imports/${t.id}`)}
                    >
                      详情
                    </button>
                    <button
                      className="btn"
                      onClick={() => {
                        if (!confirm("确认删除该任务？")) return;
                        actions.deleteTask(t.id);
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
      </div>

      <p className="muted">
        当前为占位实现：上传/任务列表/详情/错误报告下载。待 99-hub 契约定稿后接入真实接口。
      </p>
    </div>
  );
}

