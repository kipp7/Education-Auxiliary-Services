export type HomeSlotItem = {
  id: string;
  title: string;
  tag?: string;
};

export type HomeSlotsConfig = {
  banners: HomeSlotItem[];
  recommendedQuestionBanks: HomeSlotItem[];
  recommendedCourses: HomeSlotItem[];
  recommendedPlans: HomeSlotItem[];
  updatedAt: string;
};

