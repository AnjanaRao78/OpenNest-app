import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CalendarItem } from "@/types/calendar";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function safeDate(value?: string | number): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    // already yyyy-mm-dd
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

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return items;
  }

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

async function loadCollectionByAuthor(
  collectionName: string,
  authorUid?: string
): Promise<any[]> {
  const q = authorUid
    ? query(collection(db, collectionName), where("authorUid", "==", authorUid))
    : query(collection(db, collectionName));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function loadCalendarItemsByAuthor(
  authorUid?: string
): Promise<CalendarItem[]> {
  const items: CalendarItem[] = [];

  // studies
  const studies = await loadCollectionByAuthor("studies", authorUid);
  studies.forEach((d: any) => {
    const start = safeDate(d.startDate);
    const end = safeDate(d.endDate || d.startDate);

    if (start && end) {
      items.push(
        ...expandDateRange(start, end, {
          sourceId: d.id,
          type: "studies",
          title: d.courseName || "Course",
          authorUid: d.authorUid || "",
          authorName: d.authorName || "Unknown",
          href: `/entry/studies/${d.id}`,
        })
      );
    }
  });

  // hobbies
  const hobbies = await loadCollectionByAuthor("hobbies", authorUid);
  hobbies.forEach((d: any) => {
    const start = safeDate(d.startDate);
    const end = safeDate(d.endDate || d.startDate);

    if (start && end) {
      items.push(
        ...expandDateRange(start, end, {
          sourceId: d.id,
          type: "hobbies",
          title: d.hobbyName || "Hobby",
          authorUid: d.authorUid || "",
          authorName: d.authorName || "Unknown",
          href: `/entry/hobbies/${d.id}`,
        })
      );
    }
  });

  // internship
  const internships = await loadCollectionByAuthor("internship", authorUid);
  internships.forEach((d: any) => {
    const start = safeDate(d.startDate);
    const end = safeDate(d.endDate || d.startDate);

    if (start && end) {
      items.push(
        ...expandDateRange(start, end, {
          sourceId: d.id,
          type: "internship",
          title: d.company || "Internship",
          authorUid: d.authorUid || "",
          authorName: d.authorName || "Unknown",
          href: `/entry/internship/${d.id}`,
        })
      );
    }
  });

  // reading
  const reading = await loadCollectionByAuthor("reading", authorUid);
  reading.forEach((d: any) => {
    const singleDate =
      safeDate(d.startDate) ||
      safeDate(d.createdAt) ||
      formatLocalDate(new Date());

    items.push({
      id: `${d.id}-${singleDate}`,
      sourceId: d.id,
      type: "reading",
      title: d.title || "Reading",
      date: singleDate,
      dateKind: "single",
      authorUid: d.authorUid || "",
      authorName: d.authorName || "Unknown",
      href: `/entry/reading/${d.id}`,
    });
  });

  // reflections
  const reflections = await loadCollectionByAuthor("reflections", authorUid);
  reflections.forEach((d: any) => {
    const singleDate = safeDate(d.createdAt) || formatLocalDate(new Date());

    items.push({
      id: `${d.id}-${singleDate}`,
      sourceId: d.id,
      type: "reflection",
      title: d.highlight || "Reflection",
      date: singleDate,
      dateKind: "single",
      authorUid: d.authorUid || "",
      authorName: d.authorName || "Unknown",
      href: `/entry/reflection/${d.id}`,
    });
  });


  return items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.title.localeCompare(b.title);
  });
}

