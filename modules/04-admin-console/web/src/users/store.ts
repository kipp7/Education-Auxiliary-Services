import React from "react";
import { AdminConsoleUser } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type UsersState = {
  users: AdminConsoleUser[];
};

const STORAGE_KEY = "adminConsole.users.v1";

const seed: UsersState = {
  users: [
    {
      id: "user_1",
      displayName: "示例用户",
      status: "ACTIVE",
      vipValidUntil: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      bindings: [],
    },
  ],
};

function readState(): UsersState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as UsersState;
    if (!parsed || !Array.isArray(parsed.users)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

function writeState(state: UsersState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useUsersStore() {
  const [state, setState] = React.useState<UsersState>(() => readState());

  const setAndPersist = React.useCallback((next: UsersState) => {
    setState(next);
    writeState(next);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      addUser(displayName: string) {
        const now = new Date().toISOString();
        const u: AdminConsoleUser = {
          id: newId("user"),
          displayName: displayName.trim() || "新用户",
          status: "ACTIVE",
          vipValidUntil: null,
          createdAt: now,
          updatedAt: now,
          bindings: [],
        };
        setAndPersist({ users: [u, ...state.users] });
      },

      renameUser(id: string, displayName: string) {
        const now = new Date().toISOString();
        setAndPersist({
          users: state.users.map((u) =>
            u.id === id
              ? { ...u, displayName: displayName.trim() || u.displayName, updatedAt: now }
              : u,
          ),
        });
      },

      toggleStatus(id: string) {
        const now = new Date().toISOString();
        setAndPersist({
          users: state.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  status: u.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
                  updatedAt: now,
                }
              : u,
          ),
        });
      },

      removeUser(id: string) {
        setAndPersist({ users: state.users.filter((u) => u.id !== id) });
      },

      addBinding(id: string, code: string, validUntil: string | null, redeemedAt: string) {
        const now = new Date().toISOString();
        setAndPersist({
          users: state.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  vipValidUntil: validUntil,
                  updatedAt: now,
                  bindings: [
                    {
                      id: newId("bind"),
                      code,
                      redeemedAt,
                      validUntil,
                    },
                    ...u.bindings,
                  ],
                }
              : u,
          ),
        });
      },
    },
  };
}

