import React from "react";
import { Link } from "react-router-dom";
import { useCmsStore } from "../cms/store";

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

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

export function OpsExportsPage() {
  const cms = useCmsStore();

  const opsConfig = React.useMemo(() => {
    const homeSlots = readJson<any>("adminConsole.homeSlots.v1", null);
    const plansState = readJson<{ plans?: any[] }>("adminConsole.plans.v1", {});
    const courseState = readJson<{ videos?: any[] }>("adminConsole.courses.v1", {});

    const news = [...cms.state.announcements]
      .filter((a) => a.status === "PUBLISHED")
      .sort((a, b) => {
        const ap = Boolean((a as any).pinned);
        const bp = Boolean((b as any).pinned);
        if (ap !== bp) return ap ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      })
      .map((a) => ({
        id: a.id,
        title: a.title,
        summary: a.body.slice(0, 80),
        content: a.body,
        status: a.status,
        pinned: Boolean((a as any).pinned ?? false),
        updatedAt: a.updatedAt,
      }));

    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      news,
      recommendations: {
        questionBanks: homeSlots?.recommendedQuestionBanks ?? [],
        courses: homeSlots?.recommendedCourses ?? [],
        plans: homeSlots?.recommendedPlans ?? [],
      },
      plans: (Array.isArray(plansState.plans) ? plansState.plans : []).map((p) => ({
        id: String(p.id ?? ""),
        name: String(p.name ?? ""),
        priceCents: Math.round(Number(p.priceCny ?? 0) * 100),
        durationDays: Number(p.durationDays ?? 0),
        benefits: Array.isArray(p.benefits) ? p.benefits.map((b: any) => String(b.text ?? "")).join("；") : "",
        enabled: String(p.status ?? "DRAFT") === "ACTIVE",
      })),
      courses: (Array.isArray(courseState.videos) ? courseState.videos : [])
        .filter((v) => Boolean(v.enabled ?? true))
        .map((v) => ({
          id: String(v.id ?? ""),
          title: String(v.title ?? ""),
          coverUrl: String(v.coverUrl ?? ""),
          durationSeconds: Number(v.durationSeconds ?? 0),
          stage: String(v.stage ?? ""),
          grade: String(v.grade ?? ""),
          subject: String(v.subject ?? ""),
          unit: String(v.unit ?? ""),
        })),
    };
  }, [cms.state.announcements]);

  return (
    <div className="container">
      <div className="nav">
        <Link to="/">← 返回</Link>
        <div className="row">
          <button
            className="btn primary"
            onClick={() => downloadJson("ops-config.json", opsConfig)}
          >
            导出 ops-config.json
          </button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>运营/商业配置导出（占位）</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          当前为 M6 占位：导出 news/recommendations/plans，供小程序 Mock 读取；真实字段与存放路径以 99-hub
          定稿为准。
        </p>
        <pre style={{ margin: 0, overflow: "auto", maxHeight: 360 }}>
          {JSON.stringify(opsConfig, null, 2)}
        </pre>
      </div>
    </div>
  );
}
