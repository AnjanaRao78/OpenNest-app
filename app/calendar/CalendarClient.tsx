"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User } from "firebase/auth";
import { getUserProfile, subscribeToAuth } from "@/lib/auth";
import { loadCalendarItems, loadFamilyUsers } from "@/lib/calendar";
import {
  CalendarItem,
  CalendarModuleType,
  CalendarViewType,
} from "@/types/calendar";
import CalendarFilters from "@/components/CalendarFilters";
import BlackboardCalendar from "@/components/BlackboardCalendar";
import AgendaView from "@/components/AgendaView";
import ScheduleView from "@/components/ScheduleView";
import { UserProfile } from "@/types/userProfile";

const defaultModules: CalendarModuleType[] = [
  "reflection",
  "studies",
  "internship",
  "reading",
];

function getMonthRange(offset: number) {
  const today = new Date();
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const last = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);

  const year = first.getFullYear();
  const month = first.getMonth();

  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(last.getDate()).padStart(2, "0")}`;

  return { year, month, startDate, endDate };
}

export default function CalendarClient() {
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [familyUsers, setFamilyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUserUid, setSelectedUserUid] = useState<string | "all">("all");
  const [selectedModules, setSelectedModules] =
    useState<CalendarModuleType[]>(defaultModules);
  const [selectedView, setSelectedView] = useState<CalendarViewType>("month");

  const requestedOffset = Number(searchParams.get("offset"));
  const offset =
    Number.isInteger(requestedOffset) && requestedOffset >= 0 && requestedOffset <= 4
      ? requestedOffset
      : 0;

  const monthRange = useMemo(() => getMonthRange(offset), [offset]);

  function toggleModule(module: CalendarModuleType) {
    setSelectedModules((prev) => {
      if (prev.includes(module)) {
        const next = prev.filter((m) => m !== module);
        return next.length > 0 ? next : prev;
      }
      return [...prev, module];
    });
  }

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setFamilyUsers([]);
        setItems([]);
        setLoading(false);
        return;
      }

        try {
        const userProfile = (await getUserProfile(authUser.uid));
        setProfile(userProfile);

        if (!userProfile || !userProfile.familyId) {
          setFamilyUsers([]);
          setItems([]);
          setLoading(false);
          return;
        }
        const users = await loadFamilyUsers(userProfile.familyId);
        setFamilyUsers(users);
      } catch (error) {
        console.error("Calendar init failed:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    async function run() {
      if (!user || !profile) return;

      setLoading(true);

      try {
        const data = await loadCalendarItems({
          familyId: profile.familyId,
          viewerUid: user.uid,
          viewerRelationship: profile.relationship,
          selectedUserUid,
          selectedModules,
          startDate: monthRange.startDate,
          endDate: monthRange.endDate,
        });

        setItems(data);
      } catch (error) {
        console.error("Calendar load failed:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [
    user,
    profile,
    selectedUserUid,
    selectedModules,
    monthRange.startDate,
    monthRange.endDate,
  ]);

  if (loading) return <div className="p-6">Loading calendar...</div>;
  if (!user || !profile) return <div className="p-6">Please sign in first.</div>;

  return (
    <div>
      <div className="max-w-screen-sm mx-auto px-3 pt-3 flex items-center justify-between text-sm">
        <Link href="/" className="underline">
          Home
        </Link>

        <div className="flex items-center gap-4">
          {offset > 0 ? (
            <Link href={`/calendar?offset=${offset - 1}`} className="underline">
              Previous
            </Link>
          ) : (
            <span className="text-gray-400">Previous</span>
          )}

          {offset < 4 ? (
            <Link href={`/calendar?offset=${offset + 1}`} className="underline">
              Next
            </Link>
          ) : (
            <span className="text-gray-400">Next</span>
          )}
        </div>
      </div>

      <CalendarFilters
        userOptions={familyUsers}
        selectedUserUid={selectedUserUid}
        onUserChange={setSelectedUserUid}
        selectedModules={selectedModules}
        onToggleModule={toggleModule}
        selectedView={selectedView}
        onViewChange={setSelectedView}
        currentOffset={offset}
      />

      {selectedView === "month" && (
        <BlackboardCalendar
          year={monthRange.year}
          month={monthRange.month}
          items={items}
        />
      )}

      {selectedView === "agenda" && <AgendaView items={items} />}

      {selectedView === "schedule" && <ScheduleView items={items} />}
    </div>
  );
}