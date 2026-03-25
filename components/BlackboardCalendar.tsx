"use client";

import Link from "next/link";
import { CalendarItem } from "@/types/calendar";
import { getAuthorColor } from "@/lib/authorColors";
import {
  getAuthorInitial,
  getDateKindSymbol,
  shortenTitle,
} from "@/lib/calendarDisplay";

interface Props {
  year: number;
  month: number; // 0-11
  items: CalendarItem[];
}

function formatLocalDate(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

export default function BlackboardCalendar({ year, month, items }: Props) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const byDate = new Map<string, CalendarItem[]>();
  items.forEach((item) => {
    const arr = byDate.get(item.date) || [];
    arr.push(item);
    byDate.set(item.date, arr);
  });

  const monthName = firstDay.toLocaleString("default", { month: "long" });

  return (
    <div className="min-h-screen bg-[#141414] text-[#f5f0d8] px-2 py-3 sm:px-4 sm:py-4">
      <div className="max-w-screen-sm mx-auto rounded-2xl border-4 border-[#2a2a2a] bg-[#1b1b1b] shadow-2xl p-2 sm:p-4">
        
        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">
              {monthName} {year}
            </h1>
            <div className="text-[10px] sm:text-xs opacity-75 mt-1">
              ▶ start · — continues · ◀ end · • single
            </div>
          </div>

          <div className="text-[10px] sm:text-xs opacity-70 whitespace-nowrap">
            family chalkboard
          </div>
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2 text-center text-[9px] sm:text-xs uppercase tracking-wide">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="py-1 border-b border-dashed border-[#6b6b6b]"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {cells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={idx}
                  className="aspect-square rounded-xl bg-[#161616] border border-[#2d2d2d]"
                />
              );
            }

            const iso = formatLocalDate(year, month, day);
            const dayItems = byDate.get(iso) || [];

            return (
              <div
                key={idx}
                className="aspect-square rounded-xl bg-[#202020] border border-[#3a3a3a] p-1 sm:p-2 flex flex-col overflow-hidden min-h-0"
                style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.03)" }}
              >
                {/* Day number */}
                <div className="text-[10px] sm:text-sm font-semibold mb-1 shrink-0">
                  {day}
                </div>

                {/* Scrollable entries */}
                <div
                  className="space-y-1 overflow-y-auto pr-0.5 flex-1 min-h-0"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {dayItems.slice(0, 8).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      title={`${item.authorName}: ${item.title}`}
                      className={`block rounded px-1 py-0.5 text-[8px] sm:text-[10px] leading-tight border truncate hover:opacity-90 transition ${getAuthorColor(
                        item.authorUid
                      )}`}
                    >
                      {getAuthorInitial(item.authorName)}{" "}
                      {getDateKindSymbol(item.dateKind)}{" "}
                      {shortenTitle(item.title, 10)}
                    </Link>
                  ))}

                  {dayItems.length > 8 && (
                    <div className="text-[8px] sm:text-[10px] opacity-70">
                      +{dayItems.length - 8}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}