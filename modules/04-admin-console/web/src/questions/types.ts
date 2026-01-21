export type QuestionType = "SINGLE" | "MULTI" | "TF" | "FILL" | "SHORT";

export type ManagedQuestion = {
  id: string;
  stage: string;
  subject: string;
  unit: string;
  type: QuestionType;
  stem: string;
  createdAt: string;
  updatedAt: string;
};

