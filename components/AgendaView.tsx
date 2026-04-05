"use client";

import Link from "next/link";
import { CalendarItem } from "@/types/calendar";
import {
  formatHumanDate,
  getDateKindSymbol,
  getModuleLabel,
  getModulePillClass,
} from "@/lib/calendarDisplay";

export default function AgendaView({
  items,
}: {
  items: CalendarItem[];
}) {
  const grouped = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();

  return (
    <div className="max-w-screen-sm mx-auto px-3 pb-6">
      <div className="space-y-5">
        {dates.length === 0 && (
          <div className="rounded-2xl border bg-white p-5 text-sm text-gray-500">
            No items for this range.
          </div>
        )}

        {dates.map((date) => (
          <div key={date} className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold mb-3">{formatHumanDate(date)}</h2>

            <div className="space-y-3">
              {grouped[date].map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-xl border p-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {getDateKindSymbol(item.dateKind)} {item.title}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {item.authorName}
                        {item.meta ? ` · ${item.meta}` : ""}
                        {item.timeLabel ? ` · ${item.timeLabel}` : ""}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-xs px-2 py-1 rounded-full border ${getModulePillClass(
                        item.type
                      )}`}
                    >
                      {getModuleLabel(item.type)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}