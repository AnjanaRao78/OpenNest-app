import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CalendarItem, CalendarModuleType } from "@/types/calendar";
import { canUserSeeReflection } from "@/lib/reflectionVisibility";

type RelationshipType = "parent" | "sibling" | "child";

export type CalendarFilterInput = {
  familyId: string;
  viewerUid: string;
  viewerRelationship: RelationshipType;
  selectedUserUid: string | "all";
  selectedModules: CalendarModuleType[];
  startDate: string;
  endDate: string;
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function safeDate(value?: string | number): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return formatLocalDate(d);
  }

  if (typeof value === "number") {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return formatLocalDate(d);
  }

  return null;
}

function expandDateRange(
  startDate: string,
  endDate: string,
  base: Omit<CalendarItem, "id" | "date" | "dateKind">
): CalendarItem[] {
  const items: CalendarItem[] = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return items;

  const current = new Date(start);

  while (current <= end) {
    const currentDate = formatLocalDate(current);

    let dateKind: CalendarItem["dateKind"] = "middle";

    if (startDate === endDate) {
      dateKind = "single";
    } else if (currentDate === startDate) {
      dateKind = "start";
    } else if (currentDate === endDate) {
      dateKind = "end";
    }

    items.push({
      ...base,
      id: `${base.sourceId}-${currentDate}`,
      date: currentDate,
      dateKind,
    });

    current.setDate(current.getDate() + 1);
  }

  return items;
}

function withinRange(date: string, startDate: string, endDate: string) {
  return date >= startDate && date <= endDate;
}

function keepItem(
  item: CalendarItem,
  filters: CalendarFilterInput
): boolean {
  if (!filters.selectedModules.includes(item.type)) return false;
  if (!withinRange(item.date, filters.startDate, filters.endDate)) return false;

  if (
    filters.selectedUserUid !== "all" &&
    item.authorUid !== filters.selectedUserUid
  ) {
    return false;
  }

  return true;
}

async function loadUsersByFamily(familyId: string) {
  const q = query(collection(db, "users"), where("familyId", "==", familyId));
  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function loadFamilyUsers(familyId: string) {
  const users = await loadUsersByFamily(familyId);

  return users
    .map((u: any) => ({
      uid: u.uid,
      displayName: u.displayName || "Unknown",
      relationship: u.relationship || "child",
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function loadCalendarItems(
  filters: CalendarFilterInput
): Promise<CalendarItem[]> {
  const items: CalendarItem[] = [];

  if (filters.selectedModules.includes("studies")) {
    const studiesQ = query(
      collection(db, "studies"),
      where("familyId", "==", filters.familyId)
    );
    const studiesSnap = await getDocs(studiesQ);

    studiesSnap.docs.forEach((doc) => {
      const d: any = { id: doc.id, ...doc.data() };

      const start = safeDate(d.startDate);
      const end = safeDate(d.endDate || d.startDate);

      if (!start || !end) return;

      const expanded = expandDateRange(start, end, {
        sourceId: d.id,
        type: "studies",
        title: d.courseName || "Course",
        authorUid: d.authorUid || "",
        authorName: d.authorName || "Unknown",
        href: `/entry/studies/${d.id}`,
        meta: [d.courseCode, d.classroom].filter(Boolean).join(" · "),
        timeLabel:
          d.startTime && d.endTime ? `${d.startTime} - ${d.endTime}` : undefined,
        days: Array.isArray(d.days) ? d.days : [],
        startTime: d.startTime,
        endTime: d.endTime,
      });

      expanded.forEach((item) => {
        if (keepItem(item, filters)) items.push(item);
      });

      const vacationDays = Array.isArray(d.vacationDays) ? d.vacationDays : [];
      vacationDays.forEach((vacDate: string) => {
        const vac = safeDate(vacDate);
        if (!vac) return;

        const item: CalendarItem = {
          id: `${d.id}-vac-${vac}`,
          sourceId: d.id,
          type: "studies",
          title: `${d.courseName || "Course"} vacation`,
          date: vac,
          dateKind: "single",
          authorUid: d.authorUid || "",
          authorName: d.authorName || "Unknown",
          href: `/entry/studies/${d.id}`,
          meta: "No class day",
        };

        if (keepItem(item, filters)) items.push(item);
      });
    });
  }

  if (filters.selectedModules.includes("internship")) {
    const internshipsQ = query(
      collection(db, "internship"),
      where("familyId", "==", filters.familyId)
    );
    const internshipsSnap = await getDocs(internshipsQ);

    internshipsSnap.docs.forEach((doc) => {
      const d: any = { id: doc.id, ...doc.data() };

      const start = safeDate(d.startDate);
      const end = safeDate(d.endDate || d.startDate);

      if (!start || !end) return;

      const expanded = expandDateRange(start, end, {
        sourceId: d.id,
        type: "internship",
        title: d.company || "Internship",
        authorUid: d.authorUid || "",
        authorName: d.authorName || "Unknown",
        href: `/entry/internship/${d.id}`,
        meta: d.status || "",
      });

      expanded.forEach((item) => {
        if (keepItem(item, filters)) items.push(item);
      });
    });
  }

  if (filters.selectedModules.includes("reading")) {
    const readingQ = query(
      collection(db, "reading"),
      where("familyId", "==", filters.familyId)
    );
    const readingSnap = await getDocs(readingQ);

    readingSnap.docs.forEach((doc) => {
      const d: any = { id: doc.id, ...doc.data() };
      const singleDate =
        safeDate(d.startDate) || safeDate(d.createdAt) || formatLocalDate(new Date());

      const item: CalendarItem = {
        id: `${d.id}-${singleDate}`,
        sourceId: d.id,
        type: "reading",
        title: d.title || "Reading",
        date: singleDate,
        dateKind: "single",
        authorUid: d.authorUid || "",
        authorName: d.authorName || "Unknown",
        href: `/entry/reading/${d.id}`,
        meta: d.status || "",
      };

      if (keepItem(item, filters)) items.push(item);
    });
  }

  if (filters.selectedModules.includes("reflection")) {
    const reflectionsQ = query(
      collection(db, "reflections"),
      where("familyId", "==", filters.familyId)
    );
    const reflectionsSnap = await getDocs(reflectionsQ);

    reflectionsSnap.docs.forEach((doc) => {
      const d: any = { id: doc.id, ...doc.data() };

      const visible = canUserSeeReflection(d, {
        uid: filters.viewerUid,
        familyId: filters.familyId,
        relationship: filters.viewerRelationship,
      });

      if (!visible) return;

      const singleDate =
        safeDate(d.createdAt) || formatLocalDate(new Date());

      const item: CalendarItem = {
        id: `${d.id}-${singleDate}`,
        sourceId: d.id,
        type: "reflection",
        title: d.highlight || "Reflection",
        date: singleDate,
        dateKind: "single",
        authorUid: d.authorUid || "",
        authorName: d.authorName || "Unknown",
        href: `/entry/reflection/${d.id}`,
        meta: d.mood || "",
      };

      if (keepItem(item, filters)) items.push(item);
    });
  }

  return items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.authorName !== b.authorName) return a.authorName.localeCompare(b.authorName);
    return a.title.localeCompare(b.title);
  });
}