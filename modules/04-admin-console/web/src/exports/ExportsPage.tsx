import React from "react";
import { Link } from "react-router-dom";
import { useCmsStore } from "../cms/store";
import { useQuestionBankStore } from "../questionBank/store";

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

export function ExportsPage() {
  const qb = useQuestionBankStore();
  const cms = useCmsStore();

  const config = React.useMemo(() => {
    const bannerState = readJson<{ config?: { enabled?: boolean; intervalSeconds?: number }; banners?: any[] }>(
      "adminConsole.banners.v1",
      {},
    );
    const courseState = readJson<{ videos?: any[] }>("adminConsole.courses.v1", {});
    const plansState = readJson<{ plans?: any[] }>("adminConsole.plans.v1", {});
    const homeSlots = readJson<any>("adminConsole.homeSlots.v1", null);
    const questionItemsState = readJson<{ items?: any[] }>("adminConsole.questionItems.v1", {});
    const svipState = readJson<{ codes?: any[] }>("adminConsole.svip.v1", {});
    const usersState = readJson<{ users?: any[] }>("adminConsole.users.v1", {});
    const ordersState = readJson<{ orders?: any[] }>("adminConsole.orders.v1", {});

    return {
      version: 1,
      generatedAt: new Date().toISOString(),
      banners: (Array.isArray(bannerState.banners) ? bannerState.banners : []).map((b) => ({
        id: String(b.id ?? ""),
        title: String(b.title ?? ""),
        imageUrl: String(b.imageUrl ?? ""),
        linkUrl: String(b.linkUrl ?? ""),
        enabled: Boolean(b.enabled),
        sort: Number(b.sort ?? 0),
      })),
      bannerConfig: {
        enabled: Boolean(bannerState.config?.enabled ?? true),
        intervalSeconds: Number(bannerState.config?.intervalSeconds ?? 5),
      },
      questionBank: {
        subjects: qb.state.subjects,
        packages: qb.state.packages,
        chapters: qb.state.chapters,
        questions: qb.state.questions,
      },
      courses: (Array.isArray(courseState.videos) ? courseState.videos : []).map((v) => ({
        id: String(v.id ?? ""),
        stage: String(v.stage ?? ""),
        grade: String(v.grade ?? ""),
        subject: String(v.subject ?? ""),
        unit: String(v.unit ?? ""),
        title: String(v.title ?? ""),
        coverUrl: String(v.coverUrl ?? ""),
        intro: String(v.intro ?? ""),
        durationSeconds: Number(v.durationSeconds ?? 0),
        enabled: Boolean(v.enabled ?? true),
      })),
      plans: (Array.isArray(plansState.plans) ? plansState.plans : []).map((p) => ({
        id: String(p.id ?? ""),
        name: String(p.name ?? ""),
        priceCny: Number(p.priceCny ?? 0),
        durationDays: Number(p.durationDays ?? 0),
        status: String(p.status ?? "DRAFT"),
        benefits: Array.isArray(p.benefits) ? p.benefits.map((b: any) => String(b.text ?? "")) : [],
      })),
      homeSlots,
      questionItems: (Array.isArray(questionItemsState.items) ? questionItemsState.items : []).map((x) => ({
        id: String(x.id ?? ""),
        stage: String(x.stage ?? ""),
        subject: String(x.subject ?? ""),
        unit: String(x.unit ?? ""),
        type: String(x.type ?? ""),
        stem: String(x.stem ?? ""),
        answer: String(x.answer ?? ""),
      })),
      svipCodes: (Array.isArray(svipState.codes) ? svipState.codes : []).map((c) => ({
        id: String(c.id ?? ""),
        code: String(c.code ?? ""),
        status: String(c.status ?? ""),
        validUntil: c.validUntil ?? null,
        createdAt: String(c.createdAt ?? ""),
        redeemedAt: c.redeemedAt ?? null,
        redeemedBy: c.redeemedBy ?? null,
      })),
      users: (Array.isArray(usersState.users) ? usersState.users : []).map((u) => ({
        id: String(u.id ?? ""),
        displayName: String(u.displayName ?? ""),
        status: String(u.status ?? ""),
        vipValidUntil: u.vipValidUntil ?? null,
        bindings: Array.isArray(u.bindings)
          ? u.bindings.map((b: any) => ({
              code: String(b.code ?? ""),
              redeemedAt: String(b.redeemedAt ?? ""),
              validUntil: b.validUntil ?? null,
            }))
          : [],
      })),
      orders: (Array.isArray(ordersState.orders) ? ordersState.orders : []).map((o) => ({
        id: String(o.id ?? ""),
        userId: String(o.userId ?? ""),
        userDisplayName: String(o.userDisplayName ?? ""),
        status: String(o.status ?? ""),
        totalCny: Number(o.totalCny ?? 0),
        invoiceStatus: String(o.invoiceStatus ?? ""),
        createdAt: String(o.createdAt ?? ""),
        updatedAt: String(o.updatedAt ?? ""),
        items: Array.isArray(o.items)
          ? o.items.map((it: any) => ({
              title: String(it.title ?? ""),
              quantity: Number(it.quantity ?? 0),
              priceCny: Number(it.priceCny ?? 0),
            }))
          : [],
      })),
      announcements: cms.state.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        body: a.body,
        status: a.status,
        pinned: (a as any).pinned ?? false,
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

