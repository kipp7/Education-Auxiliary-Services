export type AnnouncementStatus = "DRAFT" | "PUBLISHED";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};
