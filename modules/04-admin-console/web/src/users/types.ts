export type AdminConsoleUserStatus = "ACTIVE" | "DISABLED";

export type AdminConsoleUser = {
  id: string;
  displayName: string;
  status: AdminConsoleUserStatus;
  vipValidUntil: string | null;
  createdAt: string;
  updatedAt: string;
  bindings: UserVipBinding[];
};

export type UserVipBinding = {
  id: string;
  code: string;
  redeemedAt: string;
  validUntil: string | null;
};

