import { Course } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type CourseState = {
  courses: Course[];
};

const STORAGE_KEY = "adminConsole.courses.v1";

const seed: CourseState = {
  courses: [
    {
      id: "crs_1",
      stage: "初中",
      grade: "七年级",
      subject: "数学",
      unit: "有理数",
      coverUrl: "https://picsum.photos/seed/course1/320/180",
      title: "有理数入门",
      description: "占位课程：讲解有理数的基本概念与常见题型。",
      durationSeconds: 18 * 60,
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
  ],
};

function readState(): CourseState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as CourseState;
  } catch {
    return seed;
  }
}

function writeState(state: CourseState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useCoursesStore() {
  const state = readState();

  const setState = (next: CourseState) => {
    writeState(next);
  };

  return {
    state,
    actions: {
      resetToSeed() {
        writeState(seed);
      },
      createCourse(input: Omit<Course, "id" | "createdAt" | "updatedAt">) {
        const now = new Date().toISOString();
        const course: Course = {
          id: newId("crs"),
          ...input,
          createdAt: now,
          updatedAt: now,
        };
        setState({ courses: [course, ...state.courses] });
      },
      updateCourse(id: string, patch: Partial<Omit<Course, "id" | "createdAt">>) {
        const now = new Date().toISOString();
        setState({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: now } : c,
          ),
        });
      },
      deleteCourse(id: string) {
        setState({ courses: state.courses.filter((c) => c.id !== id) });
      },
    },
  };
}

