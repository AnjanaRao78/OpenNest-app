export interface FamilyInvites{
  familyId: string;
  familyName: string;
  email: string;          // invited person's email
  invitedByUid?: string;
  status: "pending" | "accepted";
  createdAt: number;
}