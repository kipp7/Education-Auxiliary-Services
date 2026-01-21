export type Plan = {
  id: string;
  name: string;
  priceCents: number;
  durationDays: number;
  benefits: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatus = "CREATED" | "PAID" | "REFUNDED" | "CANCELED";

export type Order = {
  id: string;
  planId: string;
  userNote: string;
  status: OrderStatus;
  createdAt: string;
};

