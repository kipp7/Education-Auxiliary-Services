import { Announcement, AnnouncementStatus } from "./types";
import React from "react";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type CmsState = {
  announcements: Announcement[];
};

const STORAGE_KEY = "adminConsole.cms.v1";

const seed: CmsState = {
  announcements: [
    {
      id: "ann_1",
      title: "系统公告：欢迎使用管理台",
      body: "当前为占位实现：公告编辑/发布/下线将以 99-hub 定稿契约为准。",
      status: "PUBLISHED",
      pinned: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: "ann_2",
      title: "草稿：维护窗口说明",
      body: "这里是草稿内容，可发布后对小程序端展示。",
      status: "DRAFT",
      pinned: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ],
};

function readState(): CmsState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as CmsState;
  } catch {
    return seed;
  }
}

function writeState(state: CmsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useCmsStore() {
  const [state, setState] = React.useState<CmsState>(() => readState());

  const setAndPersist = React.useCallback((next: CmsState) => {
    setState(next);
    writeState(next);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },
      createAnnouncement(title: string, body: string) {
        const now = new Date().toISOString();
        const ann: Announcement = {
          id: newId("ann"),
          title,
          body,
          status: "DRAFT",
          pinned: false,
          createdAt: now,
          updatedAt: now,
        };
        setAndPersist({ announcements: [ann, ...state.announcements] });
      },
      updateAnnouncement(id: string, patch: { title?: string; body?: string }) {
        const now = new Date().toISOString();
        setAndPersist({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: now } : a,
          ),
        });
      },
      setStatus(id: string, status: AnnouncementStatus) {
        const now = new Date().toISOString();
        setAndPersist({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, status, updatedAt: now } : a,
          ),
        });
      },
      togglePinned(id: string) {
        const now = new Date().toISOString();
        setAndPersist({
          announcements: state.announcements.map((a) =>
            a.id === id ? { ...a, pinned: !a.pinned, updatedAt: now } : a,
          ),
        });
      },
      deleteAnnouncement(id: string) {
        setAndPersist({ announcements: state.announcements.filter((a) => a.id !== id) });
      },
    },
  };
}

