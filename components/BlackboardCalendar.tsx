"use client";

import { useMemo, useState } from "react";
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const byDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    items.forEach((item) => {
      const arr = map.get(item.date) || [];
      arr.push(item);
      map.set(item.date, arr);
    });
    return map;
  }, [items]);

  const selectedItems = selectedDate ? byDate.get(selectedDate) || [] : [];

  const monthName = firstDay.toLocaleString("default", { month: "long" });

  function closeSheet() {
    setSelectedDate(null);
  }

  return (
    <div className="min-h-screen bg-[#141414] text-[#f5f0d8] px-2 py-3 sm:px-4 sm:py-4">
      <div className="max-w-screen-sm mx-auto rounded-2xl border-4 border-[#2a2a2a] bg-[#1b1b1b] shadow-2xl p-2 sm:p-4">
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
            const hasItems = dayItems.length > 0;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => hasItems && setSelectedDate(iso)}
                className={`aspect-square rounded-xl bg-[#202020] border border-[#3a3a3a] p-1 sm:p-2 flex flex-col text-left overflow-hidden ${
                  hasItems ? "hover:opacity-95 active:scale-[0.99]" : ""
                }`}
                style={{ boxShadow: "inset 0 0 12px rgba(255,255,255,0.03)" }}
              >
                <div className="text-[10px] sm:text-sm font-semibold mb-1 shrink-0">
                  {day}
                </div>

                <div className="space-y-1">
                  {dayItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded px-1 py-0.5 text-[8px] sm:text-[10px] leading-tight border truncate ${getAuthorColor(
                        item.authorUid
                      )}`}
                    >
                      {getAuthorInitial(item.authorName)}{" "}
                      {getDateKindSymbol(item.dateKind)}{" "}
                      {shortenTitle(item.title, 10)}
                    </div>
                  ))}

                  {dayItems.length > 3 && (
                    <div className="text-[8px] sm:text-[10px] opacity-70">
                      +{dayItems.length - 3} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <>
          <div
            className="fixed inset-0 bg-black/45 z-40"
            onClick={closeSheet}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 max-w-screen-sm mx-auto">
            <div className="rounded-t-3xl border-t border-x border-[#3a3a3a] bg-[#1b1b1b] text-[#f5f0d8] shadow-2xl max-h-[75vh] flex flex-col">
              <div className="flex items-center justify-center pt-3">
                <div className="h-1.5 w-12 rounded-full bg-[#6b6b6b]" />
              </div>

              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#333]">
                <div>
                  <h2 className="text-base font-semibold">Entries</h2>
                  <p className="text-xs opacity-70">{selectedDate}</p>
                </div>

                <button
                  type="button"
                  onClick={closeSheet}
                  className="text-sm underline"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto px-4 py-3 space-y-3">
                {selectedItems.length === 0 && (
                  <p className="text-sm opacity-70">No entries for this date.</p>
                )}

                {selectedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={closeSheet}
                    className={`block rounded-2xl border p-3 transition hover:opacity-95 ${getAuthorColor(
                      item.authorUid
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {item.title}
                        </div>
                        <div className="text-xs opacity-90 mt-1">
                          {getAuthorInitial(item.authorName)} ·{" "}
                          {item.authorName} · {getDateKindSymbol(item.dateKind)}
                        </div>
                      </div>

                      <div className="text-xs shrink-0 opacity-90 underline">
                        Open
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}