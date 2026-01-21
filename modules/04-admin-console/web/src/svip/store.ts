import React from "react";
import { SvipCode, SvipCodeStatus } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 16; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out.match(/.{1,4}/g)!.join("-");
}

type SvipState = {
  codes: SvipCode[];
};

const STORAGE_KEY = "adminConsole.svip.v1";

const seed: SvipState = {
  codes: [
    {
      id: "svip_1",
      code: "ABCD-EFGH-JKLM-NPQR",
      status: "ACTIVE",
      validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      redeemedAt: null,
    },
  ],
};

function readState(): SvipState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as SvipState;
  } catch {
    return seed;
  }
}

function writeState(state: SvipState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useSvipStore() {
  const [state, setState] = React.useState<SvipState>(() => readState());

  const setAndPersist = React.useCallback((next: SvipState) => {
    setState(next);
    writeState(next);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      generateBatch(count: number, validDays: number | null) {
        const now = new Date().toISOString();
        const validUntil =
          validDays && validDays > 0
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * validDays).toISOString()
            : null;

        const items: SvipCode[] = Array.from({ length: count }).map(() => ({
          id: newId("svip"),
          code: randomCode(),
          status: "ACTIVE" as SvipCodeStatus,
          validUntil,
          createdAt: now,
          redeemedAt: null,
          redeemedBy: null,
        }));

        setAndPersist({ codes: [...items, ...state.codes] });
      },

      revoke(id: string) {
        setAndPersist({
          codes: state.codes.map((c) => (c.id === id ? { ...c, status: "REVOKED" } : c)),
        });
      },

      redeemByCode(codeRaw: string, redeemedBy: string | null) {
        const code = codeRaw.trim().toUpperCase();
        if (!code) return { ok: false as const, reason: "激活码不能为空" };

        const item = state.codes.find((c) => c.code.toUpperCase() === code);
        if (!item) return { ok: false as const, reason: "未找到该激活码" };
        if (item.status !== "ACTIVE") return { ok: false as const, reason: `该码状态为 ${item.status}` };
        if (item.validUntil) {
          const expireAt = new Date(item.validUntil).getTime();
          if (Number.isFinite(expireAt) && expireAt < Date.now()) {
            return { ok: false as const, reason: "该码已过期" };
          }
        }

        const now = new Date().toISOString();
        const next: SvipCode = {
          ...item,
          status: "REDEEMED",
          redeemedAt: now,
          redeemedBy,
        };

        setAndPersist({
          codes: state.codes.map((c) => (c.id === item.id ? next : c)),
        });

        return { ok: true as const, code: next };
      },
    },
  };
}

