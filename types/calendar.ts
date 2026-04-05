export type CalendarModuleType =
  | "reflection"
  | "studies"
  | "internship"
  | "reading";

export type CalendarDateKind = "start" | "middle" | "end" | "single";

export type CalendarViewType = "month" | "agenda" | "schedule";

export interface CalendarItem {
  id: string;
  sourceId: string;
  type: CalendarModuleType;

  title: string;
  date: string;
  dateKind: CalendarDateKind;

  authorUid: string;
  authorName: string;

  href: string;

  meta?: string;
  timeLabel?: string;

  days?: string[];
  startTime?: string;
  endTime?: string;
}

export interface CalendarUserOption {
  uid: string;
  displayName: string;
  relationship?: string;
}

export interface CalendarFilterInput {
  familyId: string;
  viewerUid: string;
  viewerRelationship: "parent" | "sibling" | "child";
  selectedUserUid: string | "all";
  selectedModules: CalendarModuleType[];
  startDate: string;
  endDate: string;
}