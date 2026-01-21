export type QuestionItemType = "SINGLE" | "MULTI" | "JUDGE" | "FILL" | "SHORT";

export type QuestionItem = {
  id: string;
  stage: string;
  subject: string;
  unit: string;
  type: QuestionItemType;
  stem: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

