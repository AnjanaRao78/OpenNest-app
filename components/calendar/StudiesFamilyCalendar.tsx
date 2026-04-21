"use client";

import Link from "next/link";
import { FamilyStudyCalendarItem } from "@/types/familyCalendar";
import { getAuthorColor } from "@/lib/authorColors";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const slotStarts = [
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
];

function toMinutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function formatSlotLabel(start: string) {
  const startMin = toMinutes(start);
  const endMin = startMin + 120;

  function fmt(mins: number) {
    const h24 = Math.floor(mins / 60);
    const m = mins % 60;
    const suffix = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}${m === 0 ? "" : `:${String(m).padStart(2, "0")}`}${suffix}`;
  }

  return `${fmt(startMin)}–${fmt(endMin)}`;
}

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

function isCourseActiveOnDate(course: FamilyStudyCalendarItem, date: Date) {
  const current = isoDate(date);
  if (current < course.startDate || current > course.endDate) return false;
  if ((course.vacationDays || []).includes(current)) return false;
  return true;
}

function doesCourseMatchDay(course: FamilyStudyCalendarItem, dayLabel: string) {
  return (course.days || []).includes(dayLabel);
}

function doesCourseOverlapSlot(course: FamilyStudyCalendarItem, slotStart: string) {
  if (!course.startTime || !course.endTime) return false;

  const courseStart = toMinutes(course.startTime);
  const courseEnd = toMinutes(course.endTime);
  const slotStartMin = toMinutes(slotStart);
  const slotEndMin = slotStartMin + 120;

  return courseStart < slotEndMin && courseEnd > slotStartMin;
}

function monthTitle(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function StudiesFamilyCalendar({
  items,
  year,
  month,
}: {
  items: FamilyStudyCalendarItem[];
  year: number;
  month: number;
}) {
  const weeks = getWeeksForMonth(year, month);

  return (
    <div className="max-w-[1100px] mx-auto px-3 pb-6">
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">{monthTitle(year, month)}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Studies calendar across family members, week by week, in 2-hour slots
        </p>

        <div className="space-y-6">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="rounded-2xl border border-[#e7dece] bg-white/90 p-3 shadow-sm overflow-x-auto"
            >
              <div className="min-w-[860px]">
                <div
                  className="grid"
                  style={{ gridTemplateColumns: "110px repeat(7, 1fr)" }}
                >
                  <div className="border-b border-[#e7dece] p-2 text-xs font-semibold text-[#62757b]">
                    Time
                  </div>

                  {week.map((date, index) => {
                    const label = dayLabels[index];
                    const inMonth = date.getMonth() === month;

                    return (
                      <div
                        key={label + isoDate(date)}
                        className="border-b border-[#e7dece] p-2 text-center"
                      >
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
                    );
                  })}

                  {slotStarts.map((slot) => (
                    <FragmentRow
                      key={`${weekIndex}-${slot}`}
                      slot={slot}
                      week={week}
                      month={month}
                      items={items}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  function FragmentRow({
    slot,
    week,
    month,
    items,
  }: {
    slot: string;
    week: Date[];
    month: number;
    items: FamilyStudyCalendarItem[];
  }) {
    return (
      <>
        <div className="border-b border-[#f0e8da] p-2 text-xs font-medium text-[#62757b] bg-[#fcfbf7]">
          {formatSlotLabel(slot)}
        </div>

        {week.map((date, index) => {
          const dayLabel = dayLabels[index];
          const inMonth = date.getMonth() === month;

          const matching = items.filter((course) => {
            return (
              inMonth &&
              isCourseActiveOnDate(course, date) &&
              doesCourseMatchDay(course, dayLabel) &&
              doesCourseOverlapSlot(course, slot)
            );
          });

          return (
            <div
              key={`${slot}-${isoDate(date)}`}
              className="border-b border-l border-[#f0e8da] p-2 min-h-[92px]"
              style={{ background: inMonth ? "white" : "#faf8f2" }}
            >
              <div className="space-y-2">
                {matching.map((course) => (
                  <Link
                    key={`${course.id}-${slot}-${isoDate(date)}`}
                    href={course.href}
                    className={`block rounded-xl border px-2 py-2 shadow-sm ${getAuthorColor(
                      course.authorUid
                    )}`}
                  >
                    <div className="text-[11px] font-semibold leading-tight">
                      {course.courseCode
                        ? `${course.courseCode} — ${course.courseName}`
                        : course.courseName}
                    </div>

                    <div className="text-[10px] mt-1 opacity-90">
                      {course.authorName}
                    </div>

                    <div className="text-[10px] opacity-90">
                      {course.startTime}–{course.endTime}
                    </div>

                    <div className="text-[10px] opacity-90">
                      {course.classroom || "No room"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </>
    );
  }
}