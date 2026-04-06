export type Relationship = "parent" | "sibling" | "child";

export interface UserProfile {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  familyId: string;
  familyName?: string;
  relationship: Relationship;
  createdAt?: number;
}