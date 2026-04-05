"use client";

import Link from "next/link";
import { CalendarItem } from "@/types/calendar";
import {
  formatHumanDate,
  getAuthorInitial,
  getDateKindSymbol,
  getModuleLabel,
  getModulePillClass,
} from "@/lib/calendarDisplay";
import { getAuthorColor } from "@/lib/authorColors";

type BottomSheetDayViewProps = {
  selectedDate: string | null;
  items: CalendarItem[];
  onClose: () => void;
};

export default function BottomSheetDayView({
  selectedDate,
  items,
  onClose,
}: BottomSheetDayViewProps) {
  if (!selectedDate) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/45 z-40" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 max-w-screen-sm mx-auto">
        <div className="rounded-t-3xl border-t border-x border-[#3a3a3a] bg-[#1b1b1b] text-[#f5f0d8] shadow-2xl max-h-[75vh] flex flex-col">
          <div className="flex items-center justify-center pt-3">
            <div className="h-1.5 w-12 rounded-full bg-[#6b6b6b]" />
          </div>

          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-[#333]">
            <div>
              <h2 className="text-base font-semibold">Entries</h2>
              <p className="text-xs opacity-70">{formatHumanDate(selectedDate)}</p>
            </div>

            <button type="button" onClick={onClose} className="text-sm underline">
              Close
            </button>
          </div>

          <div className="overflow-y-auto px-4 py-3 space-y-3">
            {items.length === 0 && (
              <p className="text-sm opacity-70">No entries for this date.</p>
            )}

            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className={`block rounded-2xl border p-3 transition hover:opacity-95 ${getAuthorColor(
                  item.authorUid
                )}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {getDateKindSymbol(item.dateKind)} {item.title}
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                      {getAuthorInitial(item.authorName)} · {item.authorName}
                      {item.meta ? ` · ${item.meta}` : ""}
                      {item.timeLabel ? ` · ${item.timeLabel}` : ""}
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full border ${getModulePillClass(
                        item.type
                      )}`}
                    >
                      {getModuleLabel(item.type)}
                    </span>
                    <span className="text-xs underline opacity-90">Open</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}