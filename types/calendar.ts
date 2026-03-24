export interface CalendarItem {
  id: string;
  sourceId: string;
  type: "studies" | "reading" | "hobbies" | "internship" | "reflection";
  title: string;
  date: string;
  dateKind: "start" | "middle" | "end" | "single";
  authorUid: string;
  authorName: string;
  href: string;
}