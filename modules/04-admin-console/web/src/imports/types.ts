export type ImportStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

export type ImportTask = {
  id: string;
  filename: string;
  createdAt: string;
  status: ImportStatus;
  progress: number; // 0-100
  total: number;
  success: number;
  failed: number;
};

export type ImportErrorRow = {
  id: string;
  taskId: string;
  row: number;
  message: string;
};

