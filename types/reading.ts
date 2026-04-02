export interface ReadingEntry {
  id?: string;
  familyId: string;
  authorUid: string;
  authorName: string;

  title: string;
  status: string; // to-read | reading | finished
  notes: string;

  startDate: string;
  endDate?: string;

  createdAt: number;
}