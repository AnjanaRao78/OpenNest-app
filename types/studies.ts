export interface StudiesEntry {
  id?: string;
  familyId: string;
  authorUid: string;
  authorName: string;

  term: string;
  courseName: string;

  courseCode?: string;

  days: string[]; // ["Mon", "Wed", "Fri"]
  classroom: string;
  startTime: string; // "09:00"
  endTime: string;   // "10:15"

  startDate: string; // term/course start
  endDate: string;   // term/course end

  vacationDays?: string[]; // ["2026-03-27", "2026-04-10"]

  notes?: string;
  createdAt: number;
}