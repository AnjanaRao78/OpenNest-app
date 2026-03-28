import { CalendarDateKind, CalendarModuleType } from "@/types/calendar";

export function getAuthorInitial(name: string): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

export function getDateKindSymbol(kind: CalendarDateKind): string {
  switch (kind) {
    case "start":
      return "▶";
    case "middle":
      return "—";
    case "end":
      return "◀";
    case "single":
    default:
      return "•";
  }
}

export function shortenTitle(title: string, max = 16): string {
  if (!title) return "";
  if (title.length <= max) return title;
  return title.slice(0, max - 1) + "…";
}

export function getModuleLabel(type: CalendarModuleType): string {
  switch (type) {
    case "reflection":
      return "Reflection";
    case "studies":
      return "Studies";
    case "internship":
      return "Internship";
    case "reading":
      return "Reading";
    default:
      return "Item";
  }
}

export function getModulePillClass(type: CalendarModuleType): string {
  switch (type) {
    case "reflection":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "studies":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "internship":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "reading":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}

export function formatHumanDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthTitle(year: number, month: number): string {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export function isSameDate(a: string, b: string): boolean {
  return a === b;
}