import React from "react";
import { Plan } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type PlansState = {
  plans: Plan[];
};

const STORAGE_KEY = "adminConsole.plans.v1";

const seed: PlansState = {
  plans: [
    {
      id: "plan_1",
      name: "SVIP 月卡（示例）",
      priceCny: 19.9,
      durationDays: 30,
      status: "ACTIVE",
      benefits: [
        { id: "b_1", text: "解锁 SVIP 权益（占位）" },
        { id: "b_2", text: "支持离线缓存（占位）" },
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ],
};

function readState(): PlansState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as PlansState;
    if (!parsed || !Array.isArray(parsed.plans)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

function writeState(state: PlansState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function usePlansStore() {
  const [state, setState] = React.useState<PlansState>(() => readState());

  const setAndPersist = React.useCallback((next: PlansState) => {
    setState(next);
    writeState(next);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      addPlan(name: string, priceCny: number, durationDays: number) {
        const now = new Date().toISOString();
        const plan: Plan = {
          id: newId("plan"),
          name: name.trim() || "新套餐",
          priceCny,
          durationDays,
          status: "DRAFT",
          benefits: [],
          createdAt: now,
          updatedAt: now,
        };
        setAndPersist({ plans: [plan, ...state.plans] });
      },

      updatePlan(id: string, patch: Partial<Pick<Plan, "name" | "priceCny" | "durationDays" | "status">>) {
        const now = new Date().toISOString();
        setAndPersist({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p)),
        });
      },

      removePlan(id: string) {
        setAndPersist({ plans: state.plans.filter((p) => p.id !== id) });
      },

      addBenefit(planId: string, text: string) {
        const t = text.trim();
        if (!t) return;
        const now = new Date().toISOString();
        setAndPersist({
          plans: state.plans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  benefits: [{ id: newId("benefit"), text: t }, ...p.benefits],
                  updatedAt: now,
                }
              : p,
          ),
        });
      },

      removeBenefit(planId: string, benefitId: string) {
        const now = new Date().toISOString();
        setAndPersist({
          plans: state.plans.map((p) =>
            p.id === planId
              ? { ...p, benefits: p.benefits.filter((b) => b.id !== benefitId), updatedAt: now }
              : p,
          ),
        });
      },
    },
  };
}

