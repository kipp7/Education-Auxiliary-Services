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
  const state = readState();

  const setState = (next: SvipState) => {
    writeState(next);
  };

  return {
    state,
    actions: {
      resetToSeed() {
        writeState(seed);
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
        }));

        setState({ codes: [...items, ...state.codes] });
      },

      revoke(id: string) {
        setState({
          codes: state.codes.map((c) => (c.id === id ? { ...c, status: "REVOKED" } : c)),
        });
      },
    },
  };
}

