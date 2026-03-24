import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CalendarItem } from "@/types/calendar";

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function expandDateRange(
  startDate: string,
  endDate: string,
  base: Omit<CalendarItem, "id" | "date" | "dateKind">
): CalendarItem[] {
  const items: CalendarItem[] = [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  const current = new Date(start);

  while (current <= end) {
    const currentDate = formatDate(current);

    let dateKind: CalendarItem["dateKind"] = "middle";

    if (currentDate === startDate && currentDate === endDate) {
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

export async function loadCalendarItemsByAuthor(authorUid?: string): Promise<CalendarItem[]> {
  const items: CalendarItem[] = [];

  async function loadCollection(collectionName: string) {
    const q = authorUid
      ? query(collection(db, collectionName), where("authorUid", "==", authorUid))
      : query(collection(db, collectionName));

    const snap = await getDocs(q);

    return snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  // studies
  const studies = await loadCollection("studies");
  studies.forEach((d: any) => {
    if (d.startDate && d.endDate) {
      items.push(
        ...expandDateRange(d.startDate, d.endDate, {
          sourceId: d.id,
          type: "studies",
          title: d.courseName,
          authorUid: d.authorUid,
          authorName: d.authorName,
          href: `/entry/studies/${d.id}`,
        })
      );
    }
  });

  // hobbies
  const hobbies = await loadCollection("hobbies");
  hobbies.forEach((d: any) => {
    if (d.startDate && d.endDate) {
      items.push(
        ...expandDateRange(d.startDate, d.endDate, {
          sourceId: d.id,
          type: "hobbies",
          title: d.hobbyName,
          authorUid: d.authorUid,
          authorName: d.authorName,
          href: `/entry/hobbies/${d.id}`,
        })
      );
    }
  });

  // internship
  const internships = await loadCollection("internship");
  internships.forEach((d: any) => {
    if (d.startDate && d.endDate) {
      items.push(
        ...expandDateRange(d.startDate, d.endDate, {
          sourceId: d.id,
          type: "internship",
          title: d.company,
          authorUid: d.authorUid,
          authorName: d.authorName,
          href: `/entry/internship/${d.id}`,
        })
      );
    }
  });

  // reading
  const reading = await loadCollection("reading");
  reading.forEach((d: any) => {
    const singleDate = d.startDate || new Date(d.createdAt).toISOString().slice(0, 10);

    items.push({
      id: `${d.id}-${singleDate}`,
      sourceId: d.id,
      type: "reading",
      title: d.title,
      date: singleDate,
      dateKind: "single",
      authorUid: d.authorUid,
      authorName: d.authorName,
      href: `/entry/reading/${d.id}`,
    });
  });

  // reflections
  const reflections = await loadCollection("reflections");
  reflections.forEach((d: any) => {
    const singleDate = new Date(d.createdAt).toISOString().slice(0, 10);

    items.push({
      id: `${d.id}-${singleDate}`,
      sourceId: d.id,
      type: "reflection",
      title: d.highlight || "Reflection",
      date: singleDate,
      dateKind: "single",
      authorUid: d.authorUid,
      authorName: d.authorName,
      href: `/entry/reflection/${d.id}`,
    });
  });

  return items.sort((a, b) => a.date.localeCompare(b.date));
}
export function getAuthorInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

export function getDateKindSymbol(
  kind: "start" | "middle" | "end" | "single"
): string {
  switch (kind) {
    case "start":
      return "▶";
    case "middle":
      return "—";
    case "end":
      return "◀";
    case "single":
      return "•";
    default:
      return "•";
  }
}

export function shortenTitle(title: string, max = 16): string {
  if (!title) return "";
  if (title.length <= max) return title;
  return title.slice(0, max - 1) + "…";
}