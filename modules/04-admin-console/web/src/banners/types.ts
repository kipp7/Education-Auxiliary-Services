export type Banner = {
  id: string;
  imageUrl: string;
  linkUrl: string;
  enabled: boolean;
  createdAt: string;
};

export type BannerState = {
  intervalSeconds: number;
  items: Banner[];
};

