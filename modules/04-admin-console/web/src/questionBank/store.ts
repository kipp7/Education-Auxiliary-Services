import { Chapter, Package, Question, Subject } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export type QuestionBankState = {
  subjects: Subject[];
  packages: Package[];
  chapters: Chapter[];
  questions: Question[];
};

const STORAGE_KEY = "adminConsole.questionBank.v1";

const seed: QuestionBankState = {
  subjects: [
    { id: "sub_math", name: "数学" },
    { id: "sub_cn", name: "语文" },
  ],
  packages: [
    { id: "pkg_math_1", subjectId: "sub_math", name: "初一上·同步题" },
    { id: "pkg_cn_1", subjectId: "sub_cn", name: "初一上·阅读理解" },
  ],
  chapters: [
    { id: "ch_math_1", packageId: "pkg_math_1", name: "第一章 有理数" },
    { id: "ch_cn_1", packageId: "pkg_cn_1", name: "第一单元" },
  ],
  questions: [
    { id: "q_math_1", chapterId: "ch_math_1", stem: "1 + 1 = ?" },
    { id: "q_cn_1", chapterId: "ch_cn_1", stem: "这篇文章的中心思想是什么？" },
  ],
};

function readState(): QuestionBankState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as QuestionBankState;
  } catch {
    return seed;
  }
}

function writeState(state: QuestionBankState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useQuestionBankStore() {
  const state = readState();

  const setState = (next: QuestionBankState) => {
    writeState(next);
  };

  return {
    state,
    actions: {
      resetToSeed() {
        writeState(seed);
      },

      addSubject(name: string) {
        const next: QuestionBankState = {
          ...state,
          subjects: [...state.subjects, { id: newId("sub"), name }],
        };
        setState(next);
      },
      renameSubject(id: string, name: string) {
        const next: QuestionBankState = {
          ...state,
          subjects: state.subjects.map((s) => (s.id === id ? { ...s, name } : s)),
        };
        setState(next);
      },
      deleteSubject(id: string) {
        const packageIds = state.packages.filter((p) => p.subjectId === id).map((p) => p.id);
        const chapterIds = state.chapters.filter((c) => packageIds.includes(c.packageId)).map((c) => c.id);
        const next: QuestionBankState = {
          subjects: state.subjects.filter((s) => s.id !== id),
          packages: state.packages.filter((p) => p.subjectId !== id),
          chapters: state.chapters.filter((c) => !packageIds.includes(c.packageId)),
          questions: state.questions.filter((q) => !chapterIds.includes(q.chapterId)),
        };
        setState(next);
      },

      addPackage(subjectId: string, name: string) {
        const next: QuestionBankState = {
          ...state,
          packages: [...state.packages, { id: newId("pkg"), subjectId, name }],
        };
        setState(next);
      },
      renamePackage(id: string, name: string) {
        const next: QuestionBankState = {
          ...state,
          packages: state.packages.map((p) => (p.id === id ? { ...p, name } : p)),
        };
        setState(next);
      },
      deletePackage(id: string) {
        const chapterIds = state.chapters.filter((c) => c.packageId === id).map((c) => c.id);
        const next: QuestionBankState = {
          ...state,
          packages: state.packages.filter((p) => p.id !== id),
          chapters: state.chapters.filter((c) => c.packageId !== id),
          questions: state.questions.filter((q) => !chapterIds.includes(q.chapterId)),
        };
        setState(next);
      },

      addChapter(packageId: string, name: string) {
        const next: QuestionBankState = {
          ...state,
          chapters: [...state.chapters, { id: newId("ch"), packageId, name }],
        };
        setState(next);
      },
      renameChapter(id: string, name: string) {
        const next: QuestionBankState = {
          ...state,
          chapters: state.chapters.map((c) => (c.id === id ? { ...c, name } : c)),
        };
        setState(next);
      },
      deleteChapter(id: string) {
        const next: QuestionBankState = {
          ...state,
          chapters: state.chapters.filter((c) => c.id !== id),
          questions: state.questions.filter((q) => q.chapterId !== id),
        };
        setState(next);
      },

      addQuestion(chapterId: string, stem: string) {
        const next: QuestionBankState = {
          ...state,
          questions: [...state.questions, { id: newId("q"), chapterId, stem }],
        };
        setState(next);
      },
      updateQuestion(id: string, stem: string) {
        const next: QuestionBankState = {
          ...state,
          questions: state.questions.map((q) => (q.id === id ? { ...q, stem } : q)),
        };
        setState(next);
      },
      deleteQuestion(id: string) {
        const next: QuestionBankState = {
          ...state,
          questions: state.questions.filter((q) => q.id !== id),
        };
        setState(next);
      },
    },
  };
}

