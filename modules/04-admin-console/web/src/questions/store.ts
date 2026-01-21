import { ManagedQuestion, QuestionType } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type QuestionsState = {
  questions: ManagedQuestion[];
};

const STORAGE_KEY = "adminConsole.questions.v1";

const seed: QuestionsState = {
  questions: [
    {
      id: "mq_1",
      stage: "初中",
      subject: "数学",
      unit: "有理数",
      type: "SINGLE",
      stem: "下列属于有理数的是（ ）",
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: "mq_2",
      stage: "初中",
      subject: "语文",
      unit: "阅读理解",
      type: "SHORT",
      stem: "请概括本文的中心思想。",
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
  ],
};

function readState(): QuestionsState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as QuestionsState;
  } catch {
    return seed;
  }
}

function writeState(state: QuestionsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useManagedQuestionsStore() {
  const state = readState();

  const setState = (next: QuestionsState) => {
    writeState(next);
  };

  return {
    state,
    actions: {
      resetToSeed() {
        writeState(seed);
      },
      create(input: Omit<ManagedQuestion, "id" | "createdAt" | "updatedAt">) {
        const now = new Date().toISOString();
        const q: ManagedQuestion = {
          id: newId("mq"),
          ...input,
          createdAt: now,
          updatedAt: now,
        };
        setState({ questions: [q, ...state.questions] });
      },
      update(
        id: string,
        patch: Partial<Omit<ManagedQuestion, "id" | "createdAt">>,
      ) {
        const now = new Date().toISOString();
        setState({
          questions: state.questions.map((q) =>
            q.id === id ? { ...q, ...patch, updatedAt: now } : q,
          ),
        });
      },
      remove(id: string) {
        setState({ questions: state.questions.filter((q) => q.id !== id) });
      },
    },
  };
}

export const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "SINGLE", label: "单选" },
  { value: "MULTI", label: "多选" },
  { value: "TF", label: "判断" },
  { value: "FILL", label: "填空" },
  { value: "SHORT", label: "简答" },
];

