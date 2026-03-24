"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { loadCalendarItemsByAuthor } from "@/lib/calendar";
import { CalendarItem } from "@/types/calendar";
import BlackboardCalendar from "@/components/BlackboardCalendar";

export default function CalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setItems([]);
        setLoading(false);
        return;
      }

      try {
        const data = await loadCalendarItemsByAuthor();
        setItems(data);
      } catch (error) {
        console.error("Failed to load calendar items:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  function goToPreviousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((prev) => prev - 1);
    } else {
      setMonth((prev) => prev - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((prev) => prev + 1);
    } else {
      setMonth((prev) => prev + 1);
    }
  }

  if (loading) return <div className="p-6">Loading calendar...</div>;
  if (!user) return <div className="p-6">Please sign in first.</div>;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 pt-4 flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={goToPreviousMonth}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Previous Month
          </button>

          <button
            onClick={goToNextMonth}
            className="px-4 py-2 rounded bg-black text-white"
          >
            Next Month
          </button>
        </div>

        <Link href="/" className="underline">
          Home
        </Link>
      </div>

      <BlackboardCalendar year={year} month={month} items={items} />
    </div>
  );
}