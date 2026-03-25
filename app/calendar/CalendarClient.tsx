"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadCalendarItemsByAuthor } from "@/lib/calendar";
import { loadReflections } from "@/lib/reflections";
import { canUserSeeReflection } from "@/lib/reflectionVisibility";
import { CalendarItem } from "@/types/calendar";
import BlackboardCalendar from "@/components/BlackboardCalendar";

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
  };
}

function sameMonth(aYear: number, aMonth: number, bYear: number, bMonth: number) {
  return aYear === bYear && aMonth === bMonth;
}

export default function CalendarClient() {
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const previousAllowed = shiftMonth(currentYear, currentMonth, -1);
  const nextAllowed = shiftMonth(currentYear, currentMonth, 1);

  const requestedYear = Number(searchParams.get("year"));
  const requestedMonth = Number(searchParams.get("month"));

  let year = Number.isInteger(requestedYear) ? requestedYear : currentYear;
  let month =
    Number.isInteger(requestedMonth) && requestedMonth >= 0 && requestedMonth <= 11
      ? requestedMonth
      : currentMonth;

  const isAllowedMonth =
    sameMonth(year, month, currentYear, currentMonth) ||
    sameMonth(year, month, previousAllowed.year, previousAllowed.month) ||
    sameMonth(year, month, nextAllowed.year, nextAllowed.month);

  if (!isAllowedMonth) {
    year = currentYear;
    month = currentMonth;
  }

  const prevTarget = useMemo(() => shiftMonth(year, month, -1), [year, month]);
  const nextTarget = useMemo(() => shiftMonth(year, month, 1), [year, month]);

  const showPreviousLink =
    sameMonth(prevTarget.year, prevTarget.month, currentYear, currentMonth) ||
    sameMonth(prevTarget.year, prevTarget.month, previousAllowed.year, previousAllowed.month) ||
    sameMonth(prevTarget.year, prevTarget.month, nextAllowed.year, nextAllowed.month);

  const showNextLink =
    sameMonth(nextTarget.year, nextTarget.month, currentYear, currentMonth) ||
    sameMonth(nextTarget.year, nextTarget.month, previousAllowed.year, previousAllowed.month) ||
    sameMonth(nextTarget.year, nextTarget.month, nextAllowed.year, nextAllowed.month);

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(authUser.uid);
        setProfile(userProfile);

        if (!userProfile) {
          setItems([]);
          setLoading(false);
          return;
        }

        const allCalendarItems = await loadCalendarItemsByAuthor();

        const reflections = await loadReflections(userProfile.familyId);
        const visibleReflectionIds = new Set(
          reflections
            .filter((reflection) =>
              canUserSeeReflection(reflection, {
                uid: authUser.uid,
                familyId: userProfile.familyId,
                relationship: userProfile.relationship,
              })
            )
            .map((reflection) => reflection.id)
        );

        const filteredCalendarItems = allCalendarItems.filter((item) => {
          if (item.type !== "reflection") return true;
          return visibleReflectionIds.has(item.sourceId);
        });

        setItems(filteredCalendarItems);
      } catch (error) {
        console.error("Failed to load calendar:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="p-6">Loading calendar...</div>;
  if (!user || !profile) return <div className="p-6">Please sign in first.</div>;

  return (
    <div>
      <div className="max-w-screen-sm mx-auto px-3 pt-3 flex items-center justify-between text-sm">
        <Link href="/" className="underline">
          Home
        </Link>

        <div className="flex items-center gap-4">
          {showPreviousLink ? (
            <Link
              href={`/calendar?year=${prevTarget.year}&month=${prevTarget.month}`}
              className="underline"
            >
              Previous
            </Link>
          ) : (
            <span className="text-gray-400">Previous</span>
          )}

          {showNextLink ? (
            <Link
              href={`/calendar?year=${nextTarget.year}&month=${nextTarget.month}`}
              className="underline"
            >
              Next
            </Link>
          ) : (
            <span className="text-gray-400">Next</span>
          )}
        </div>
      </div>

      <BlackboardCalendar year={year} month={month} items={items} />
    </div>
  );
}