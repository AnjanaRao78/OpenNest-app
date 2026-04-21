export type FamilyCalendarModule =
  | "studies"
  | "reading"
  | "internship"
  | "reflection";

export type FamilyCalendarView =
  | "month"
  | "agenda"
  | "timeline"
  | "schedule";

export interface FamilyCalendarUserOption {
  uid: string;
  displayName: string;
  relationship?: string;
}

export interface FamilyCalendarFilterInput {
  module: FamilyCalendarModule;
  familyId: string;
  viewerUid: string;
  viewerRelationship: "parent" | "sibling" | "child";
  selectedUserUid: string | "all";
  startDate: string;
  endDate: string;
}

export interface FamilyStudyCalendarItem {
  id: string;
  sourceId: string;
  authorUid: string;
  authorName: string;
  term: string;
  courseName: string;
  courseCode?: string;
  classroom?: string;
  startTime?: string;
  endTime?: string;
  startDate: string;
  endDate: string;
  days: string[];
  vacationDays?: string[];
  href: string;
}