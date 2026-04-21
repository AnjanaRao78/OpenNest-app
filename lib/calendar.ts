import { collection, getDocs, query, where } from "firebase/firestore";
import { requireDb } from "@/lib/firestoreClient";

import {
  CalendarFilterInput,
  CalendarItem,
  CalendarModuleType,
  CalendarUserOption,
} from "@/types/calendar";
import { canUserSeeReflection } from "@/lib/reflectionVisibility";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value?: string | number | null): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    return formatLocalDate(parsed);
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    return formatLocalDate(parsed);
  }

  return null;
}

function overlapsRange(
  itemStart: string,
  itemEnd: string,
  rangeStart: string,
  rangeEnd: string
) {
  return itemStart <= rangeEnd && itemEnd >= rangeStart;
}

function expandRangeToItems(
  startDate: string,
  endDate: string,
  base: Omit<CalendarItem, "id" | "date" | "dateKind">
): CalendarItem[] {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return [];
  }

  const items: CalendarItem[] = [];
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

function keepByFilters(item: CalendarItem, filters: CalendarFilterInput): boolean {
  if (!filters.selectedModules.includes(item.type)) return false;

  if (item.date < filters.startDate || item.date > filters.endDate) return false;

  if (
    filters.selectedUserUid !== "all" &&
    item.authorUid !== filters.selectedUserUid
  ) {
    return false;
  }

  return true;
}

function sortCalendarItems(items: CalendarItem[]) {
  return items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    if (a.authorName !== b.authorName) return a.authorName.localeCompare(b.authorName);
    return a.title.localeCompare(b.title);
  });
}

async function loadCollectionByFamily(collectionName: string, familyId: string) {
  const firestore = requireDb();
  const q = query(collection(firestore, collectionName), where("familyId", "==", familyId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as any),
  }));
}

function buildStudiesItems(rows: any[], filters: CalendarFilterInput): CalendarItem[] {
  const items: CalendarItem[] = [];

  rows.forEach((row) => {
    const start = parseDate(row.startDate);
    const end = parseDate(row.endDate || row.startDate);

    if (!start || !end) return;
    if (!overlapsRange(start, end, filters.startDate, filters.endDate)) return;

    const expanded = expandRangeToItems(start, end, {
      sourceId: row.id,
      type: "studies",
      title: row.courseName || "Course",
      authorUid: row.authorUid || "",
      authorName: row.authorName || "Unknown",
      href: `/entry/studies/${row.id}`,
      meta: [row.courseCode, row.classroom].filter(Boolean).join(" · "),
      timeLabel:
        row.startTime && row.endTime ? `${row.startTime} - ${row.endTime}` : undefined,
      days: Array.isArray(row.days) ? row.days : [],
      startTime: row.startTime,
      endTime: row.endTime,
    });

    expanded.forEach((item) => {
      if (keepByFilters(item, filters)) items.push(item);
    });

    const vacationDays = Array.isArray(row.vacationDays) ? row.vacationDays : [];

    vacationDays.forEach((vacDate: string) => {
      const vac = parseDate(vacDate);
      if (!vac) return;

      const item: CalendarItem = {
        id: `${row.id}-vac-${vac}`,
        sourceId: row.id,
        type: "studies",
        title: `${row.courseName || "Course"} vacation`,
        date: vac,
        dateKind: "single",
        authorUid: row.authorUid || "",
        authorName: row.authorName || "Unknown",
        href: `/entry/studies/${row.id}`,
        meta: "No class day",
      };

      if (keepByFilters(item, filters)) items.push(item);
    });
  });

  return items;
}

function buildInternshipItems(rows: any[], filters: CalendarFilterInput): CalendarItem[] {
  const items: CalendarItem[] = [];

  rows.forEach((row) => {
    const start = parseDate(row.startDate);
    const end = parseDate(row.endDate || row.startDate);

    if (!start || !end) return;
    if (!overlapsRange(start, end, filters.startDate, filters.endDate)) return;

    const expanded = expandRangeToItems(start, end, {
      sourceId: row.id,
      type: "internship",
      title: row.company || "Internship",
      authorUid: row.authorUid || "",
      authorName: row.authorName || "Unknown",
      href: `/entry/internship/${row.id}`,
      meta: row.status || "",
    });

    expanded.forEach((item) => {
      if (keepByFilters(item, filters)) items.push(item);
    });
  });

  return items;
}

function buildReadingItems(rows: any[], filters: CalendarFilterInput): CalendarItem[] {
  const items: CalendarItem[] = [];

  rows.forEach((row) => {
    const start = parseDate(row.startDate) || parseDate(row.createdAt);
    if (!start) return;

    let end: string;

    if (row.status === "reading") {
      end = parseDate(row.endDate) || filters.endDate;
    } else if (row.status === "finished") {
      end = parseDate(row.endDate) || start;
    } else {
      end = start;
    }

    if (!overlapsRange(start, end, filters.startDate, filters.endDate)) return;

    const expanded = expandRangeToItems(start, end, {
      sourceId: row.id,
      type: "reading",
      title: row.title || "Reading",
      authorUid: row.authorUid || "",
      authorName: row.authorName || "Unknown",
      href: `/entry/reading/${row.id}`,
      meta: row.status || "",
    });

    expanded.forEach((item) => {
      if (keepByFilters(item, filters)) items.push(item);
    });
  });

  return items;
}

function buildReflectionItems(rows: any[], filters: CalendarFilterInput): CalendarItem[] {
  const items: CalendarItem[] = [];

  rows.forEach((row) => {
    const visible = canUserSeeReflection(row, {
      uid: filters.viewerUid,
      familyId: filters.familyId,
      relationship: filters.viewerRelationship,
    });

    if (!visible) return;

    const date = parseDate(row.createdAt);
    if (!date) return;

    const item: CalendarItem = {
      id: `${row.id}-${date}`,
      sourceId: row.id,
      type: "reflection",
      title: row.highlight || "Reflection",
      date,
      dateKind: "single",
      authorUid: row.authorUid || "",
      authorName: row.authorName || "Unknown",
      href: `/entry/reflection/${row.id}`,
      meta: row.mood || "",
    };

    if (keepByFilters(item, filters)) items.push(item);
  });

  return items;
}

export async function loadFamilyUsers(
  familyId: string
): Promise<CalendarUserOption[]> {
  const rows = await loadCollectionByFamily("users", familyId);

  return rows
    .map((row) => ({
      uid: row.uid,
      displayName: row.displayName || "Unknown",
      relationship: row.relationship || "child",
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function loadCalendarItems(
  filters: CalendarFilterInput
): Promise<CalendarItem[]> {
  const loaders: Partial<Record<CalendarModuleType, Promise<any[]>>> = {};

  if (filters.selectedModules.includes("studies")) {
    loaders.studies = loadCollectionByFamily("studies", filters.familyId);
  }

  if (filters.selectedModules.includes("internship")) {
    loaders.internship = loadCollectionByFamily("internship", filters.familyId);
  }

  if (filters.selectedModules.includes("reading")) {
    loaders.reading = loadCollectionByFamily("reading", filters.familyId);
  }

  if (filters.selectedModules.includes("reflection")) {
    loaders.reflection = loadCollectionByFamily("reflections", filters.familyId);
  }

  const [studiesRows, internshipRows, readingRows, reflectionRows] =
    await Promise.all([
      loaders.studies ?? Promise.resolve([]),
      loaders.internship ?? Promise.resolve([]),
      loaders.reading ?? Promise.resolve([]),
      loaders.reflection ?? Promise.resolve([]),
    ]);

  const items = [
    ...buildStudiesItems(studiesRows, filters),
    ...buildInternshipItems(internshipRows, filters),
    ...buildReadingItems(readingRows, filters),
    ...buildReflectionItems(reflectionRows, filters),
  ];

  return sortCalendarItems(items);
}