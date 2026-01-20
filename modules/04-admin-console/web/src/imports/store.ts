import { ImportErrorRow, ImportStatus, ImportTask } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type ImportState = {
  tasks: ImportTask[];
  errors: ImportErrorRow[];
};

const STORAGE_KEY = "adminConsole.imports.v1";

const seed: ImportState = {
  tasks: [
    {
      id: "imp_1",
      filename: "question-bank-2026-01.xlsx",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "DONE",
      progress: 100,
      total: 120,
      success: 118,
      failed: 2,
    },
    {
      id: "imp_2",
      filename: "packages.zip",
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      status: "FAILED",
      progress: 40,
      total: 80,
      success: 30,
      failed: 10,
    },
  ],
  errors: [
    { id: "err_1", taskId: "imp_1", row: 33, message: "题干为空" },
    { id: "err_2", taskId: "imp_1", row: 87, message: "选项格式不合法" },
    { id: "err_3", taskId: "imp_2", row: 12, message: "章节 ID 缺失" },
    { id: "err_4", taskId: "imp_2", row: 55, message: "图片资源不存在" },
  ],
};

function readState(): ImportState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as ImportState;
  } catch {
    return seed;
  }
}

function writeState(state: ImportState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useImportsStore() {
  const state = readState();

  const setState = (next: ImportState) => {
    writeState(next);
  };

  function createTask(filename: string): ImportTask {
    const createdAt = new Date().toISOString();
    const total = 100;
    return {
      id: newId("imp"),
      filename,
      createdAt,
      status: "PENDING",
      progress: 0,
      total,
      success: 0,
      failed: 0,
    };
  }

  function withTaskStatus(taskId: string, status: ImportStatus, progress: number) {
    const next: ImportState = {
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status, progress } : t,
      ),
    };
    setState(next);
  }

  return {
    state,
    actions: {
      resetToSeed() {
        writeState(seed);
      },

      createUploadTask(filename: string) {
        const task = createTask(filename);
        setState({ ...state, tasks: [task, ...state.tasks] });

        // Simulate a running task.
        setTimeout(() => withTaskStatus(task.id, "RUNNING", 15), 300);
        setTimeout(() => withTaskStatus(task.id, "RUNNING", 55), 900);
        setTimeout(() => withTaskStatus(task.id, "DONE", 100), 1600);
      },

      deleteTask(taskId: string) {
        const next: ImportState = {
          tasks: state.tasks.filter((t) => t.id !== taskId),
          errors: state.errors.filter((e) => e.taskId !== taskId),
        };
        setState(next);
      },

      getTask(taskId: string): ImportTask | undefined {
        return state.tasks.find((t) => t.id === taskId);
      },

      getErrors(taskId: string): ImportErrorRow[] {
        return state.errors.filter((e) => e.taskId === taskId);
      },
    },
  };
}

