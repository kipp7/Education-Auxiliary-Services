import { Banner, BannerState } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

const STORAGE_KEY = "adminConsole.banners.v1";

const seed: BannerState = {
  intervalSeconds: 4,
  items: [
    {
      id: "ban_1",
      imageUrl: "https://picsum.photos/seed/banner1/960/360",
      linkUrl: "https://example.com",
      enabled: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "ban_2",
      imageUrl: "https://picsum.photos/seed/banner2/960/360",
      linkUrl: "https://example.com/help",
      enabled: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ],
};

function readState(): BannerState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as BannerState;
  } catch {
    return seed;
  }
}

function writeState(state: BannerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useBannerStore() {
  const state = readState();

  const setState = (next: BannerState) => {
    writeState(next);
  };

  return {
    state,
    actions: {
      resetToSeed() {
        writeState(seed);
      },
      setIntervalSeconds(seconds: number) {
        const next: BannerState = { ...state, intervalSeconds: seconds };
        setState(next);
      },
      addBanner(imageUrl: string, linkUrl: string) {
        const now = new Date().toISOString();
        const banner: Banner = {
          id: newId("ban"),
          imageUrl,
          linkUrl,
          enabled: true,
          createdAt: now,
        };
        setState({ ...state, items: [banner, ...state.items] });
      },
      updateBanner(
        id: string,
        patch: Partial<Pick<Banner, "imageUrl" | "linkUrl" | "enabled">>,
      ) {
        setState({
          ...state,
          items: state.items.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        });
      },
      removeBanner(id: string) {
        setState({ ...state, items: state.items.filter((b) => b.id !== id) });
      },
      move(id: string, direction: "up" | "down") {
        const idx = state.items.findIndex((b) => b.id === id);
        if (idx < 0) return;
        const target = direction === "up" ? idx - 1 : idx + 1;
        if (target < 0 || target >= state.items.length) return;
        const items = [...state.items];
        const [picked] = items.splice(idx, 1);
        items.splice(target, 0, picked);
        setState({ ...state, items });
      },
    },
  };
}

