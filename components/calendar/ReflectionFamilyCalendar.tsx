"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getAuthorColor } from "@/lib/authorColors";

type FamilyReflectionItem = {
  id: string;
  authorUid: string;
  authorName: string;
  authorRelationship?: string;
  highlight?: string;
  challenge?: string;
  mood?: string;
  needType?: string;
  visibility?: string;
  createdAt?: number;
  href: string;
};

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(value?: number | string | null) {
  if (!value) return null;

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return null;
    return isoDate(parsed);
  }

  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return null;
  return isoDate(parsed);
}

function getMonthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  const adjustedStart = startWeekday === 0 ? 6 : startWeekday - 1;

  for (let i = 0; i < adjustedStart; i++) cells.push(null);

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}

function monthTitle(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function moodTone(mood?: string) {
  const value = (mood || "").toLowerCase();

  if (["happy", "excited", "joyful", "grateful"].includes(value)) {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }

  if (["calm", "peaceful", "steady"].includes(value)) {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }

  if (["anxious", "stressed", "worried", "sad", "tired"].includes(value)) {
    return "bg-rose-50 text-rose-800 border-rose-200";
  }

  return "bg-blue-50 text-blue-800 border-blue-200";
}

function needLabel(value?: string) {
  if (!value) return "-";

  switch (value) {
    case "listening":
      return "Listening";
    case "advice":
      return "Advice";
    case "space":
      return "Space";
    case "celebrate":
      return "Celebrate";
    case "practical":
      return "Practical help";
    default:
      return value;
  }
}

export default function ReflectionFamilyCalendar({
  items,
  year,
  month,
}: {
  items: FamilyReflectionItem[];
  year: number;
  month: number;
}) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const cells = getMonthMatrix(year, month);

  const grouped = useMemo(() => {
    const map = new Map<string, FamilyReflectionItem[]>();

    items.forEach((item) => {
      const date = parseDate(item.createdAt);
      if (!date) return;

      const arr = map.get(date) || [];
      arr.push(item);
      map.set(date, arr);
    });

    return map;
  }, [items]);

  const selectedItems = selectedDate ? grouped.get(selectedDate) || [] : [];

  return (
    <div className="max-w-[1100px] mx-auto px-3 pb-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">{monthTitle(year, month)}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Reflection calendar across family members
        </p>

        <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-semibold text-gray-500">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((dateObj, index) => {
            if (!dateObj) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[120px] rounded-2xl border bg-[#faf8f2] border-[#f0e8da]"
                />
              );
            }

            const dateKey = isoDate(dateObj);
            const dayItems = grouped.get(dateKey) || [];

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => dayItems.length > 0 && setSelectedDate(dateKey)}
                className="min-h-[120px] rounded-2xl border bg-white border-[#f0e8da] p-3 text-left align-top"
              >
                <div className="text-xs font-semibold text-[#24343a]">
                  {dateObj.getDate()}
                </div>

                <div className="mt-2 space-y-2">
                  {dayItems.length === 0 && (
                    <div className="text-[11px] text-gray-300">—</div>
                  )}

                  {dayItems.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-xl border px-2 py-2 text-[11px] shadow-sm ${getAuthorColor(
                        item.authorUid
                      )}`}
                    >
                      <div className="font-semibold truncate">
                        {item.authorName}
                      </div>
                      <div className="truncate opacity-90">
                        {item.highlight || "Reflection"}
                      </div>
                    </div>
                  ))}

                  {dayItems.length > 2 && (
                    <div className="text-[11px] text-gray-500">
                      +{dayItems.length - 2} more
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
            onClick={() => setSelectedDate(null)}
          />

          <div className="fixed inset-x-0 bottom-0 z-50 max-w-screen-sm mx-auto">
            <div className="rounded-t-3xl border-t border-x border-[#3a3a3a] bg-[#1b1b1b] text-[#f5f0d8] shadow-2xl max-h-[75vh] flex flex-col">
              <div className="flex items-center justify-center pt-3">
                <div className="h-1.5 w-12 rounded-full bg-[#6b6b6b]" />
              </div>

              <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#333]">
                <div>
                  <h2 className="text-base font-semibold">Reflections</h2>
                  <p className="text-xs opacity-70">{selectedDate}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="text-sm underline"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto px-4 py-3 space-y-3">
                {selectedItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setSelectedDate(null)}
                    className={`block rounded-2xl border p-3 transition hover:opacity-95 ${getAuthorColor(
                      item.authorUid
                    )}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {item.authorName}
                        </div>
                        <div className="text-xs opacity-90 mt-1">
                          {item.authorRelationship || "-"}
                          {item.visibility ? ` · ${item.visibility}` : ""}
                        </div>
                      </div>

                      {item.mood && (
                        <span
                          className={`shrink-0 rounded-full border px-2 py-1 text-[10px] ${moodTone(
                            item.mood
                          )}`}
                        >
                          {item.mood}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 text-sm">
                      <strong>Highlight:</strong> {item.highlight || "-"}
                    </div>

                    <div className="mt-2 text-sm">
                      <strong>Challenge:</strong> {item.challenge || "-"}
                    </div>

                    <div className="mt-2 text-sm">
                      <strong>Need:</strong> {needLabel(item.needType)}
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