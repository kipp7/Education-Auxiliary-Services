import React from "react";
import { CourseVideo } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type CoursesState = {
  videos: CourseVideo[];
};

const STORAGE_KEY = "adminConsole.courses.v1";

const seed: CoursesState = {
  videos: [
    {
      id: "cv_1",
      stage: "小学",
      grade: "一年级",
      subject: "数学",
      unit: "加减法",
      title: "加法入门（示例）",
      coverUrl: "https://placehold.co/320x180?text=cover",
      intro: "这里是课程简介（占位）。",
      durationSeconds: 600,
      enabled: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ],
};

function readState(): CoursesState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as CoursesState;
    if (!parsed || !Array.isArray(parsed.videos)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

function writeState(state: CoursesState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useCoursesStore() {
  const [state, setState] = React.useState<CoursesState>(() => readState());

  const setAndPersist = React.useCallback((next: CoursesState) => {
    setState(next);
    writeState(next);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      addVideo(partial: Omit<CourseVideo, "id" | "createdAt" | "updatedAt">) {
        const now = new Date().toISOString();
        const v: CourseVideo = { ...partial, id: newId("cv"), createdAt: now, updatedAt: now };
        setAndPersist({ videos: [v, ...state.videos] });
      },

      updateVideo(
        id: string,
        patch: Partial<
          Pick<
            CourseVideo,
            | "stage"
            | "grade"
            | "subject"
            | "unit"
            | "title"
            | "coverUrl"
            | "intro"
            | "durationSeconds"
            | "enabled"
          >
        >,
      ) {
        const now = new Date().toISOString();
        setAndPersist({
          videos: state.videos.map((v) => (v.id === id ? { ...v, ...patch, updatedAt: now } : v)),
        });
      },

      removeVideo(id: string) {
        setAndPersist({ videos: state.videos.filter((v) => v.id !== id) });
      },
    },
  };
}

