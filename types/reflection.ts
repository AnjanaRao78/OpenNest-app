export type VisibilityScope =
| "everyone"
| "parentsOnly"
| "siblingOnly"
| "onlyMe";

export interface ReflectionPost {
  id?: string;
  familyId: string;
  authorUid: string;
  authorName: string;
  authorRelationship: "parent" | "sibling" | "child";
  mood: string;
  highlight: string;
  challenge: string;
  needType: string;
  visibility: VisibilityScope;
  createdAt: number;
}