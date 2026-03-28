"use client";

import Link from "next/link";
import { CalendarItem } from "@/types/calendar";

type Props = {
  selectedDate: string | null;
  items: CalendarItem[];
  onClose: () => void;
};

export default function BottomSheetDayView({
  selectedDate,
  items,
  onClose,
}: Props) {
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
              <p className="text-xs opacity-70">{selectedDate}</p>
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
                className="block rounded-2xl border border-[#3a3a3a] bg-[#242424] p-3 hover:bg-[#2b2b2b] transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{item.title}</div>
                    <div className="text-xs opacity-90 mt-1">
                      {item.type} · {item.authorName}
                    </div>
                    {item.meta && (
                      <div className="text-xs opacity-75 mt-1">{item.meta}</div>
                    )}
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
  );
}