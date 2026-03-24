import { ReflectionPost } from "@/types/reflection";

export function canUserSeeReflection(
  reflection: ReflectionPost,
  viewer: {
    uid: string;
    familyId: string;
    relationship: "parent" | "sibling" | "child";
  }
): boolean {
  if (reflection.familyId !== viewer.familyId) return false;

  if (reflection.visibility === "everyone") return true;

  if (reflection.visibility === "onlyMe") {
    return reflection.authorUid === viewer.uid;
  }

  if (reflection.visibility === "parentsOnly") {
    return viewer.relationship === "parent";
  }

  if (reflection.visibility === "siblingOnly") {
    return viewer.relationship === "sibling" || viewer.relationship === "child";
  }

  return false;
}