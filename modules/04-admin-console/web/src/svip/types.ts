export type SvipCodeStatus = "ACTIVE" | "REDEEMED" | "REVOKED";

export type SvipCode = {
  id: string;
  code: string;
  status: SvipCodeStatus;
  validUntil: string | null;
  createdAt: string;
  redeemedAt: string | null;
};

