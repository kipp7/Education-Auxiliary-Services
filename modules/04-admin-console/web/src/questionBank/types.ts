export type Subject = {
  id: string;
  name: string;
};

export type Package = {
  id: string;
  subjectId: string;
  name: string;
};

export type Chapter = {
  id: string;
  packageId: string;
  name: string;
};

export type Question = {
  id: string;
  chapterId: string;
  stem: string;
};

