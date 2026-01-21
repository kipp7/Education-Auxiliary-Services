import { Order, OrderStatus, Plan } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type OrdersState = {
  plans: Plan[];
  orders: Order[];
};

const STORAGE_KEY = "adminConsole.orders.v1";

const seed: OrdersState = {
  plans: [
    {
      id: "plan_1",
      name: "月度会员",
      priceCents: 2999,
      durationDays: 30,
      benefits: "解锁所有题库；去广告（占位）",
      enabled: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: "plan_2",
      name: "年度会员",
      priceCents: 19999,
      durationDays: 365,
      benefits: "解锁所有题库；专属客服（占位）",
      enabled: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ],
  orders: [
    {
      id: "ord_1",
      planId: "plan_1",
      userNote: "user_123（占位）",
      status: "PAID",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: "ord_2",
      planId: "plan_2",
      userNote: "user_456（占位）",
      status: "CREATED",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
};

function readState(): OrdersState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    return JSON.parse(raw) as OrdersState;
  } catch {
    return seed;
  }
}

function writeState(state: OrdersState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useOrdersStore() {
  const state = readState();

  const setState = (next: OrdersState) => {
    writeState(next);
  };

  return {
    state,
    actions: {
      resetToSeed() {
        writeState(seed);
      },

      createPlan(input: Omit<Plan, "id" | "createdAt" | "updatedAt">) {
        const now = new Date().toISOString();
        const plan: Plan = { id: newId("plan"), ...input, createdAt: now, updatedAt: now };
        setState({ ...state, plans: [plan, ...state.plans] });
      },
      updatePlan(id: string, patch: Partial<Omit<Plan, "id" | "createdAt">>) {
        const now = new Date().toISOString();
        setState({
          ...state,
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now } : p)),
        });
      },
      deletePlan(id: string) {
        setState({
          plans: state.plans.filter((p) => p.id !== id),
          orders: state.orders.filter((o) => o.planId !== id),
        });
      },

      createOrder(planId: string, userNote: string) {
        const order: Order = {
          id: newId("ord"),
          planId,
          userNote,
          status: "CREATED",
          createdAt: new Date().toISOString(),
        };
        setState({ ...state, orders: [order, ...state.orders] });
      },
      setOrderStatus(id: string, status: OrderStatus) {
        setState({
          ...state,
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        });
      },
      deleteOrder(id: string) {
        setState({ ...state, orders: state.orders.filter((o) => o.id !== id) });
      },
    },
  };
}

export function centsToYuan(cents: number) {
  return (cents / 100).toFixed(2);
}

