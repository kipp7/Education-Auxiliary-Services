export type OrderStatus = "PAID" | "REFUNDED" | "CANCELED";

export type InvoiceStatus = "NONE" | "REQUESTED" | "ISSUED";

export type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  priceCny: number;
};

export type Order = {
  id: string;
  userId: string;
  userDisplayName: string;
  status: OrderStatus;
  totalCny: number;
  items: OrderItem[];
  invoiceStatus: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
};

