export interface InternshipEntry {
  id?: string;
  familyId: string;
  authorUid: string;
  authorName: string;

  company: string;
  status: string; // searching | interviewing | offered | active
  milestone: string;
  blocker: string;

  startDate: string;
  endDate: string;

  createdAt: number;
}