export type FamilyCalendarFilterInput = {
  familyId: string;
  viewerUid: string;
  viewerRelationship?: string;
  selectedUserUid: string | "all";
};