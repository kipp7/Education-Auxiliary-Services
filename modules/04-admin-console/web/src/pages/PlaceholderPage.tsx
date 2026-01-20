import { Link } from "react-router-dom";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p className="muted">页面骨架已就绪，待契约定稿后接入真实数据。</p>
        <Link to="/">返回首页</Link>
      </div>
    </div>
  );
}

