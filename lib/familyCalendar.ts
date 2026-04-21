import { collection, getDocs, query, where } from "firebase/firestore";
import { requireDb } from "@/lib/firestoreClient";
import {
  FamilyCalendarFilterInput,
  FamilyCalendarUserOption,
  FamilyStudyCalendarItem,
} from "@/types/familyCalendar";
import { loadReflectionsForHome } from "./reflections";

async function loadCollectionByFamily(collectionName: string, familyId: string) {
  const firestore = requireDb();
  const q = query(
    collection(firestore, collectionName),
    where("familyId", "==", familyId)
  );
  const snap = await getDocs(q);

  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as any[];
}

function keepByUser(authorUid: string, selectedUserUid: string | "all") {
  if (selectedUserUid === "all") return true;
  return authorUid === selectedUserUid;
}

export async function loadFamilyUsers(
  familyId: string
): Promise<FamilyCalendarUserOption[]> {
  const rows = await loadCollectionByFamily("users", familyId);

  return rows
    .map((row: any) => ({
      uid: row.uid,
      displayName: row.displayName || "Unknown",
      relationship: row.relationship || "child",
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function loadFamilyStudiesCalendar(
  filters: FamilyCalendarFilterInput
): Promise<FamilyStudyCalendarItem[]> {
  const rows = await loadCollectionByFamily("studies", filters.familyId);

  return rows
    .filter((row: any) => keepByUser(row.authorUid || "", filters.selectedUserUid))
    .map((row: any) => ({
      id: row.id,
      sourceId: row.id,
      authorUid: row.authorUid || "",
      authorName: row.authorName || "Unknown",
      term: row.term || "",
      courseName: row.courseName || "Course",
      courseCode: row.courseCode || "",
      classroom: row.classroom || "",
      startTime: row.startTime || "",
      endTime: row.endTime || "",
      startDate: row.startDate || "",
      endDate: row.endDate || "",
      days: Array.isArray(row.days) ? row.days : [],
      vacationDays: Array.isArray(row.vacationDays) ? row.vacationDays : [],
      href: `/entry/studies/${row.id}`,
    }))
    .filter((row) => !!row.startDate && !!row.endDate);
}

export async function loadFamilyReflectionMonthItems(
  filters: FamilyCalendarFilterInput
) {
  const rows = await loadReflectionsForHome(
    filters.familyId,
    filters.viewerUid,          // fixed
    filters.viewerRelationship
  );

  return rows.filter((row: any) =>
    keepByUser(row.authorUid || "", filters.selectedUserUid)
  );
}

export async function loadFamilyReadingItems(
  filters: FamilyCalendarFilterInput
) {
  const rows = await loadCollectionByFamily("reading", filters.familyId);

  return rows.filter((row: any) =>
    keepByUser(row.authorUid || "", filters.selectedUserUid)
  );
}

export async function loadFamilyInternshipItems(
  filters: FamilyCalendarFilterInput
) {
  const rows = await loadCollectionByFamily("internship", filters.familyId);

  return rows.filter((row: any) =>
    keepByUser(row.authorUid || "", filters.selectedUserUid)
  );
}