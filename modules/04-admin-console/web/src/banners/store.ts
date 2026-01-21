import React from "react";
import { Banner, BannerConfig } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type BannersState = {
  config: BannerConfig;
  banners: Banner[];
};

const STORAGE_KEY = "adminConsole.banners.v1";

const seed: BannersState = {
  config: { enabled: true, intervalSeconds: 5 },
  banners: [
    {
      id: "ban_1",
      title: "示例 Banner 1",
      imageUrl: "https://placehold.co/800x360?text=banner+1",
      linkUrl: "https://example.com",
      enabled: true,
      sort: 1,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: "ban_2",
      title: "示例 Banner 2",
      imageUrl: "https://placehold.co/800x360?text=banner+2",
      linkUrl: "https://example.com",
      enabled: true,
      sort: 2,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ],
};

function readState(): BannersState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as BannersState;
    if (!parsed || !Array.isArray(parsed.banners) || !parsed.config) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

function writeState(state: BannersState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalize(state: BannersState): BannersState {
  const intervalSeconds = Math.max(1, Math.min(60, Math.floor(state.config.intervalSeconds || 5)));
  const banners = [...state.banners].sort((a, b) => a.sort - b.sort);
  return { ...state, config: { ...state.config, intervalSeconds }, banners };
}

export function useBannersStore() {
  const [state, setState] = React.useState<BannersState>(() => normalize(readState()));

  const setAndPersist = React.useCallback((next: BannersState) => {
    const normalized = normalize(next);
    setState(normalized);
    writeState(normalized);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      setConfig(patch: Partial<BannerConfig>) {
        setAndPersist({ ...state, config: { ...state.config, ...patch } });
      },

      createBanner(input: Pick<Banner, "title" | "imageUrl" | "linkUrl">) {
        const now = new Date().toISOString();
        const nextSort = (state.banners.at(-1)?.sort ?? 0) + 1;
        const banner: Banner = {
          id: newId("ban"),
          title: input.title.trim() || "新 Banner",
          imageUrl: input.imageUrl.trim(),
          linkUrl: input.linkUrl.trim(),
          enabled: true,
          sort: nextSort,
          createdAt: now,
          updatedAt: now,
        };
        setAndPersist({ ...state, banners: [...state.banners, banner] });
      },

      updateBanner(id: string, patch: Partial<Pick<Banner, "title" | "imageUrl" | "linkUrl" | "enabled">>) {
        const now = new Date().toISOString();
        setAndPersist({
          ...state,
          banners: state.banners.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: now } : b)),
        });
      },

      removeBanner(id: string) {
        setAndPersist({ ...state, banners: state.banners.filter((b) => b.id !== id) });
      },

      move(id: string, dir: "up" | "down") {
        const list = [...state.banners].sort((a, b) => a.sort - b.sort);
        const idx = list.findIndex((b) => b.id === id);
        if (idx < 0) return;
        const swapWith = dir === "up" ? idx - 1 : idx + 1;
        if (swapWith < 0 || swapWith >= list.length) return;
        const a = list[idx];
        const b = list[swapWith];
        const now = new Date().toISOString();
        const next = list.map((x) => {
          if (x.id === a.id) return { ...x, sort: b.sort, updatedAt: now };
          if (x.id === b.id) return { ...x, sort: a.sort, updatedAt: now };
          return x;
        });
        setAndPersist({ ...state, banners: next });
      },
    },
  };
}

