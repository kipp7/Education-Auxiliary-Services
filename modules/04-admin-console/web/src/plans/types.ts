export type PlanBenefit = {
  id: string;
  text: string;
};

export type Plan = {
  id: string;
  name: string;
  priceCny: number;
  durationDays: number;
  status: "DRAFT" | "ACTIVE";
  benefits: PlanBenefit[];
  createdAt: string;
  updatedAt: string;
};

