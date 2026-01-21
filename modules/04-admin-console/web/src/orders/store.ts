import React from "react";
import { InvoiceStatus, Order } from "./types";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

type OrdersState = {
  orders: Order[];
};

const STORAGE_KEY = "adminConsole.orders.v1";

const seed: OrdersState = {
  orders: [
    {
      id: "ord_1",
      userId: "user_1",
      userDisplayName: "示例用户",
      status: "PAID",
      totalCny: 19.9,
      items: [{ id: "item_1", title: "SVIP 月卡（示例）", quantity: 1, priceCny: 19.9 }],
      invoiceStatus: "NONE",
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: "ord_2",
      userId: "user_2",
      userDisplayName: "张三",
      status: "REFUNDED",
      totalCny: 39.8,
      items: [{ id: "item_2a", title: "SVIP 月卡（示例）", quantity: 2, priceCny: 19.9 }],
      invoiceStatus: "REQUESTED",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
  ],
};

function readState(): OrdersState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as OrdersState;
    if (!parsed || !Array.isArray(parsed.orders)) return seed;
    return parsed;
  } catch {
    return seed;
  }
}

function writeState(state: OrdersState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useOrdersStore() {
  const [state, setState] = React.useState<OrdersState>(() => readState());

  const setAndPersist = React.useCallback((next: OrdersState) => {
    setState(next);
    writeState(next);
  }, []);

  return {
    state,
    actions: {
      resetToSeed() {
        setAndPersist(seed);
      },

      createOrder(userDisplayName: string, totalCny: number) {
        const now = new Date().toISOString();
        const o: Order = {
          id: newId("ord"),
          userId: newId("user"),
          userDisplayName: userDisplayName.trim() || "新用户",
          status: "PAID",
          totalCny,
          items: [
            {
              id: newId("item"),
              title: "示例商品（占位）",
              quantity: 1,
              priceCny: totalCny,
            },
          ],
          invoiceStatus: "NONE",
          createdAt: now,
          updatedAt: now,
        };
        setAndPersist({ orders: [o, ...state.orders] });
      },

      setInvoiceStatus(id: string, invoiceStatus: InvoiceStatus) {
        const now = new Date().toISOString();
        setAndPersist({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, invoiceStatus, updatedAt: now } : o,
          ),
        });
      },

      setStatus(id: string, status: Order["status"]) {
        const now = new Date().toISOString();
        setAndPersist({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status, updatedAt: now } : o)),
        });
      },

      removeOrder(id: string) {
        setAndPersist({ orders: state.orders.filter((o) => o.id !== id) });
      },
    },
  };
}

