import React from "react";
import { HomeSlotItem, HomeSlotsConfig } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

const STORAGE_KEY = "adminConsole.homeSlots.v1";

const seed: HomeSlotsConfig = {
  banners: [
    { id: "banner_1", title: "示例 Banner 1", tag: "link:/pages/news/detail?id=1" },
    { id: "banner_2", title: "示例 Banner 2", tag: "link:/pages/course/detail?id=1" },
  ],
  recommendedQuestionBanks: [{ id: "qb_1", title: "推荐题库（示例）" }],
  recommendedCourses: [{ id: "course_1", title: "推荐课程（示例）" }],
  recommendedPlans: [{ id: "plan_1", title: "推荐套餐（示例）" }],
  updatedAt: new Date().toISOString(),
};

function readState(): HomeSlotsConfig {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as HomeSlotsConfig;
    if (!parsed || typeof parsed !== "object") return seed;
    return parsed;
  } catch {
    return seed;
  }
}

function writeState(state: HomeSlotsConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeItems(items: HomeSlotItem[]) {
  return items.filter((x) => x.title.trim()).map((x) => ({ ...x, title: x.title.trim() }));
}

export function useHomeSlotsStore() {
  const [state, setState] = React.useState<HomeSlotsConfig>(() => readState());

  const setAndPersist = React.useCallback((next: HomeSlotsConfig) => {
    const normalized: HomeSlotsConfig = {
      ...next,
      banners: normalizeItems(next.banners),
      recommendedQuestionBanks: normalizeItems(next.recommendedQuestionBanks),
      recommendedCourses: normalizeItems(next.recommendedCourses),
      recommendedPlans: normalizeItems(next.recommendedPlans),
      updatedAt: new Date().toISOString(),
    };
    setState(normalized);
    writeState(normalized);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      addItem(
        list:
          | "banners"
          | "recommendedQuestionBanks"
          | "recommendedCourses"
          | "recommendedPlans",
        title: string,
        tag?: string,
      ) {
        const item: HomeSlotItem = {
          id: newId("slot"),
          title,
          tag: tag?.trim() || undefined,
        };
        setAndPersist({
          ...state,
          [list]: [item, ...state[list]],
        });
      },

      updateItem(
        list:
          | "banners"
          | "recommendedQuestionBanks"
          | "recommendedCourses"
          | "recommendedPlans",
        id: string,
        patch: Partial<Pick<HomeSlotItem, "title" | "tag">>,
      ) {
        setAndPersist({
          ...state,
          [list]: state[list].map((x) => (x.id === id ? { ...x, ...patch } : x)),
        });
      },

      removeItem(
        list:
          | "banners"
          | "recommendedQuestionBanks"
          | "recommendedCourses"
          | "recommendedPlans",
        id: string,
      ) {
        setAndPersist({
          ...state,
          [list]: state[list].filter((x) => x.id !== id),
        });
      },
    },
  };
}

