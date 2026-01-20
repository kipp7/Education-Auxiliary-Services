export type AnnouncementStatus = "DRAFT" | "PUBLISHED";

export type Announcement = {
  id: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  createdAt: string;
  updatedAt: string;
};

