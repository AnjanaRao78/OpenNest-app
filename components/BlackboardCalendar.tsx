"use client";

import Link from "next/link";
import { CalendarItem } from "@/types/calendar";
import { getAuthorColor } from "@/lib/authorColors";
import { getAuthorInitial, getDateKindSymbol } from "@/lib/calendarDisplay";

interface Props {
  year: number;
  month: number;
  items: CalendarItem[];
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
    <div className="min-h-screen bg-[#141414] text-[#f5f0d8] p-6">
      <div className="max-w-7xl mx-auto rounded-3xl border-4 border-[#2a2a2a] bg-[#1b1b1b] shadow-2xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-4xl font-bold">{monthName} {year}</h1>
          <div className="text-sm opacity-80">Open-Nest chalkboard</div>
        </div>

        <div className="grid grid-cols-7 gap-3 mb-3 text-center text-sm uppercase tracking-widest">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-2 border-b border-dashed border-[#6b6b6b]">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-3">
          {cells.map((day, idx) => {
            if (!day) {
              return (
                <div
                  key={idx}
                  className="min-h-[150px] rounded-2xl bg-[#161616] border border-[#2d2d2d]"
                />
              );
            }

            const iso = new Date(year, month, day).toISOString().slice(0, 10);
            const dayItems = byDate.get(iso) || [];

            return (
              <div
                key={idx}
                className="min-h-[150px] rounded-2xl bg-[#202020] border border-[#3a3a3a] p-3"
              >
                <div className="text-lg font-semibold mb-2">{day}</div>

                <div className="space-y-1">
                  {dayItems.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`block rounded-md px-2 py-1 text-[10px] leading-tight border truncate hover:opacity-90 ${getAuthorColor(item.authorUid)}`}
                      title={`${item.authorName}: ${item.title}`}
                    >
                      {getAuthorInitial(item.authorName)} {getDateKindSymbol(item.dateKind)} {item.title}
                    </Link>
                  ))}

                  {dayItems.length > 5 && (
                    <div className="text-[10px] opacity-70">
                      +{dayItems.length - 5} more
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