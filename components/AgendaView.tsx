"use client";

import Link from "next/link";
import { CalendarItem } from "@/types/calendar";

type Props = {
  items: CalendarItem[];
};

function formatHumanDate(date: string) {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function AgendaView({ items }: Props) {
  const grouped = items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort();

  return (
    <div className="max-w-screen-sm mx-auto px-3 pb-6 space-y-4">
      {dates.length === 0 && (
        <div className="rounded-2xl border bg-white p-4 text-sm text-gray-500">
          No items in this range.
        </div>
      )}

      {dates.map((date) => (
        <div key={date} className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-3">{formatHumanDate(date)}</h2>

          <div className="space-y-3">
            {grouped[date].map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="block rounded-xl border bg-slate-50 p-3 hover:bg-slate-100 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {item.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {item.type} · {item.authorName}
                    </div>
                    {item.meta && (
                      <div className="text-sm text-gray-500 mt-1">
                        {item.meta}
                      </div>
                    )}
                  </div>

                  <div className="text-sm underline shrink-0">Open</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}