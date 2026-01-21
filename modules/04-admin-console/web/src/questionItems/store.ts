import React from "react";
import { QuestionItem } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type QuestionItemsState = {
  items: QuestionItem[];
};

const STORAGE_KEY = "adminConsole.questionItems.v1";

const seed: QuestionItemsState = {
  items: [
    {
      id: "qi_1",
      stage: "小学",
      subject: "数学",
      unit: "加减法",
      type: "SINGLE",
      stem: "1 + 1 = ?",
      answer: "2",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ],
};

function readState(): QuestionItemsState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as QuestionItemsState;
    if (!parsed || !Array.isArray(parsed.items)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

function writeState(state: QuestionItemsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useQuestionItemsStore() {
  const [state, setState] = React.useState<QuestionItemsState>(() => readState());

  const setAndPersist = React.useCallback((next: QuestionItemsState) => {
    setState(next);
    writeState(next);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      addItem(partial: Omit<QuestionItem, "id" | "createdAt" | "updatedAt">) {
        const now = new Date().toISOString();
        const item: QuestionItem = { ...partial, id: newId("qi"), createdAt: now, updatedAt: now };
        setAndPersist({ items: [item, ...state.items] });
      },

      updateItem(
        id: string,
        patch: Partial<
          Pick<QuestionItem, "stage" | "subject" | "unit" | "type" | "stem" | "answer">
        >,
      ) {
        const now = new Date().toISOString();
        setAndPersist({
          items: state.items.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: now } : x)),
        });
      },

      removeItem(id: string) {
        setAndPersist({ items: state.items.filter((x) => x.id !== id) });
      },

      importMany(items: Omit<QuestionItem, "id" | "createdAt" | "updatedAt">[]) {
        const now = new Date().toISOString();
        const next = items
          .filter((x) => x.stem.trim())
          .map((x) => ({ ...x, id: newId("qi"), createdAt: now, updatedAt: now } satisfies QuestionItem));
        setAndPersist({ items: [...next, ...state.items] });
      },
    },
  };
}

