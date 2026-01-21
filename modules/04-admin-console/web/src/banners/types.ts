export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  enabled: boolean;
  sort: number;
  createdAt: string;
  updatedAt: string;
};

export type BannerConfig = {
  intervalSeconds: number;
  enabled: boolean;
};

