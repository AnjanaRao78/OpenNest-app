export interface HobbyEntry {
  id?: string;
  familyId: string;
  authorUid: string;
  authorName: string;
  title: string;
  hobbyName?: string;
  category?: string;
  skillLevel?: string;
  frequency?: string;
  notes?: string;

  status?: "planned" | "started" | "in-progress" | "completed";
  startDate?: string;
  targetEndDate?: string;
  completedDate?: string;
  progress?: number; // 0 to 100

  createdAt: number;
}