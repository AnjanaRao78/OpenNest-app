"use client";

import Link from "next/link";
import { getAuthorColor } from "@/lib/authorColors";

type FamilyInternshipItem = {
  id: string;
  authorUid: string;
  authorName: string;
  company: string;
  status: string;
  milestone?: string;
  blocker?: string;
  startDate?: string;
  endDate?: string;
  href: string;
};

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(value?: string | number | null): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    return isoDate(parsed);
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;
  return isoDate(parsed);
}

function getWeeksForMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const start = new Date(first);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);

  const end = new Date(last);
  const endDay = end.getDay();
  const sundayOffset = endDay === 0 ? 0 : 7 - endDay;
  end.setDate(end.getDate() + sundayOffset);

  const weeks: Date[][] = [];
  const cursor = new Date(start);

  while (cursor <= end) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

function monthTitle(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function internshipAppearsOnDate(item: FamilyInternshipItem, date: string) {
  const start = parseDate(item.startDate);
  const end = parseDate(item.endDate || item.startDate);

  if (!start || !end) return false;
  return start <= date && date <= end;
}

function statusLabel(status: string) {
  switch (status) {
    case "searching":
      return "Searching";
    case "interviewing":
      return "Interviewing";
    case "offered":
      return "Offered";
    case "active":
      return "Active";
    default:
      return status || "-";
  }
}

function statusPillClass(status: string) {
  switch (status) {
    case "searching":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "interviewing":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "offered":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "active":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function InternshipFamilyCalendar({
  items,
  year,
  month,
}: {
  items: FamilyInternshipItem[];
  year: number;
  month: number;
}) {
  const weeks = getWeeksForMonth(year, month);

  return (
    <div className="max-w-[1100px] mx-auto px-3 pb-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">{monthTitle(year, month)}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Internship calendar across family members
        </p>

        <div className="space-y-6">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="rounded-2xl border border-[#e7dece] bg-white/90 p-3 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {week.map((date, index) => {
                  const label = dayLabels[index];
                  const dateKey = isoDate(date);
                  const inMonth = date.getMonth() === month;

                  const dayItems = items.filter((item) =>
                    inMonth ? internshipAppearsOnDate(item, dateKey) : false
                  );

                  return (
                    <div
                      key={dateKey}
                      className="rounded-xl border min-h-[190px] p-3"
                      style={{
                        background: inMonth ? "white" : "#faf8f2",
                        borderColor: "#f0e8da",
                      }}
                    >
                      <div className="mb-3">
                        <div
                          className="text-xs font-semibold"
                          style={{ color: inMonth ? "#24343a" : "#9aa7ab" }}
                        >
                          {label}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: inMonth ? "#62757b" : "#b6bfc2" }}
                        >
                          {date.getMonth() + 1}/{date.getDate()}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {dayItems.length === 0 && (
                          <div className="text-[11px] text-gray-400">—</div>
                        )}

                        {dayItems.map((item) => (
                          <Link
                            key={`${item.id}-${dateKey}`}
                            href={item.href}
                            className={`block rounded-xl border px-2 py-2 shadow-sm ${getAuthorColor(
                              item.authorUid
                            )}`}
                          >
                            <div className="text-[11px] font-semibold leading-tight">
                              {item.company}
                            </div>

                            <div className="text-[10px] mt-1 opacity-90">
                              {item.authorName}
                            </div>

                            <div className="mt-2">
                              <span
                                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] ${statusPillClass(
                                  item.status
                                )}`}
                              >
                                {statusLabel(item.status)}
                              </span>
                            </div>

                            {item.milestone && (
                              <div className="text-[10px] mt-2 opacity-90">
                                Milestone: {item.milestone}
                              </div>
                            )}

                            {item.blocker && (
                              <div className="text-[10px] mt-1 opacity-90">
                                Blocker: {item.blocker}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}