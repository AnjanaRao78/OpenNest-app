"use client";

import Link from "next/link";

export type HobbyCalendarItem = {
  id: string;
  title: string;
  authorName: string;
  status?: string;
  startDate?: string;
  targetEndDate?: string;
  completedDate?: string;
  href: string;
};

type Props = {
  items: HobbyCalendarItem[];
  year: number;
  month: number; // 0-indexed
};

function toDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDate(value?: string) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return start;
}

function endOfMonthGrid(year: number, month: number) {
  const last = new Date(year, month + 1, 0);
  const end = new Date(last);
  end.setDate(last.getDate() + (6 - last.getDay()));
  return end;
}

function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

function isSameMonth(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() === month;
}

function itemOccursOnDate(item: HobbyCalendarItem, date: Date) {
  const start = parseDate(item.startDate);
  const end =
    parseDate(item.completedDate) ||
    parseDate(item.targetEndDate) ||
    parseDate(item.startDate);

  if (!start || !end) return false;

  const check = parseDate(toDateKey(date));
  if (!check) return false;

  return check >= start && check <= end;
}

function statusTone(status?: string) {
  switch (status) {
    case "completed":
      return { bg: "rgba(111, 167, 162, 0.18)", border: "rgba(111, 167, 162, 0.45)" };
    case "in-progress":
      return { bg: "rgba(217, 188, 107, 0.20)", border: "rgba(217, 188, 107, 0.48)" };
    case "started":
      return { bg: "rgba(156, 179, 216, 0.20)", border: "rgba(156, 179, 216, 0.48)" };
    default:
      return { bg: "rgba(0,0,0,0.05)", border: "rgba(0,0,0,0.12)" };
  }
}

export default function HobbyFamilyCalendar({ items, year, month }: Props) {
  const gridStart = startOfMonthGrid(year, month);
  const gridEnd = endOfMonthGrid(year, month);
  const days = eachDay(gridStart, gridEnd);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="opennest-card">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {weekdayLabels.map((label) => (
          <div
            key={label}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--on-text-soft)",
              textAlign: "center",
              padding: "4px 0",
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {days.map((day) => {
          const dayItems = items.filter((item) => itemOccursOnDate(item, day));
          const inMonth = isSameMonth(day, year, month);

          return (
            <div
              key={day.toISOString()}
              style={{
                minHeight: 124,
                borderRadius: 16,
                padding: 10,
                border: "1px solid rgba(0,0,0,0.08)",
                background: inMonth ? "white" : "rgba(0,0,0,0.03)",
                opacity: inMonth ? 1 : 0.72,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: inMonth ? "var(--on-text)" : "var(--on-text-soft)",
                }}
              >
                {day.getDate()}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {dayItems.slice(0, 3).map((item) => {
                  const tone = statusTone(item.status);

                  return (
                    <Link
                      key={`${item.id}-${toDateKey(day)}`}
                      href={item.href}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "inherit",
                        borderRadius: 10,
                        padding: "6px 8px",
                        background: tone.bg,
                        border: `1px solid ${tone.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          lineHeight: 1.2,
                          marginBottom: 2,
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "var(--on-text-soft)",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.authorName}
                      </div>
                    </Link>
                  );
                })}

                {dayItems.length > 3 ? (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--on-text-soft)",
                      paddingLeft: 2,
                    }}
                  >
                    +{dayItems.length - 3} more
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}