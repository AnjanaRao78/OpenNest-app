export type VisibilityScope =
  | "everyone"
  | "parentsOnly"
  | "siblingOnly"
  | "onlyMe";

export interface ReflectionPost {
  id?: string;
  familyId: string;
  authorName: string;
  authorRole: "parent" | "child";
  mood: string;
  highlight: string;
  challenge: string;
  needType: string;
  visibility: VisibilityScope;
  createdAt: number;
}