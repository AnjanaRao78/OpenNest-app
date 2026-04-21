"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { getUserProfile, subscribeToAuth } from "@/lib/auth";
import {
  loadFamilyInternshipItems,
  loadFamilyReadingItems,
  loadFamilyReflectionMonthItems,
  loadFamilyStudiesCalendar,
  loadFamilyUsers,
} from "@/lib/familyCalendar";
import {
  FamilyCalendarModule,
  FamilyCalendarUserOption,
} from "@/types/familyCalendar";

import ReadingFamilyCalendar from "@/components/calendar/ReadingFamilyCalendar";
import FamilyCalendarFilters from "@/components/FamilyCalendarFilters";
import StudiesFamilyCalendar from "@/components/calendar/StudiesFamilyCalendar";
import InternshipFamilyCalendar from "@/components/calendar/InternshipFamilyCalendar";
import ReflectionFamilyCalendar from "@/components/calendar/ReflectionFamilyCalendar";

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

const allowedModules: FamilyCalendarModule[] = [
  "studies",
  "reading",
  "internship",
  "reflection",
];

type ReadingItem = {
  id: string;
  authorUid?: string;
  authorName?: string;
  title?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: number;
};

export default function CalendarClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [familyUsers, setFamilyUsers] = useState<FamilyCalendarUserOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [studiesItems, setStudiesItems] = useState<any[]>([]);
  const [readingItems, setReadingItems] = useState<ReadingItem[]>([]);
  const [internshipItems, setInternshipItems] = useState<any[]>([]);
  const [reflectionItems, setReflectionItems] = useState<any[]>([]);

  const moduleParam = searchParams.get("module") as FamilyCalendarModule | null;
  const selectedModule: FamilyCalendarModule = allowedModules.includes(
    moduleParam as FamilyCalendarModule
  )
    ? (moduleParam as FamilyCalendarModule)
    : "studies";

  const selectedUserUidParam = searchParams.get("user");
  const selectedUserUid = selectedUserUidParam || "all";

  const requestedOffset = Number(searchParams.get("offset"));
  const offset =
    Number.isInteger(requestedOffset) && requestedOffset >= 0 && requestedOffset <= 4
      ? requestedOffset
      : 0;

  const monthRange = useMemo(() => getMonthRange(offset), [offset]);

  function updateQuery(next: {
    module?: FamilyCalendarModule;
    user?: string | "all";
    offset?: number;
  }) {
    const nextModule = next.module ?? selectedModule;
    const user = next.user ?? selectedUserUid;
    const nextOffset = next.offset ?? offset;

    router.push(
      `/calendar?module=${nextModule}&user=${user}&offset=${nextOffset}`
    );
  }

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setFamilyUsers([]);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(authUser.uid);
        setProfile(userProfile);

        if (!userProfile) {
          setFamilyUsers([]);
          setLoading(false);
          return;
        }

        const users = await loadFamilyUsers(userProfile.familyId);
        setFamilyUsers(users);
      } catch (error) {
        console.error("Family calendar init failed:", error);
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
        const filters = {
          module: selectedModule,
          familyId: profile.familyId,
          viewerUid: user.uid,
          viewerRelationship: profile.relationship,
          selectedUserUid: selectedUserUid as string | "all",
          startDate: monthRange.startDate,
          endDate: monthRange.endDate,
        } as const;

        if (selectedModule === "studies") {
          const data = await loadFamilyStudiesCalendar(filters);
          setStudiesItems(data);
        }

        if (selectedModule === "reading") {
          const data = await loadFamilyReadingItems(filters);
          setReadingItems(data);
        }

        if (selectedModule === "internship") {
          const data = await loadFamilyInternshipItems(filters);
          setInternshipItems(data);
        }

        if (selectedModule === "reflection") {
          const data = await loadFamilyReflectionMonthItems(filters);
          setReflectionItems(data);
        }
      } catch (error) {
        console.error("Family calendar module load failed:", error);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [
    user,
    profile,
    selectedModule,
    selectedUserUid,
    monthRange.startDate,
    monthRange.endDate,
  ]);

  if (loading) return <div className="p-6">Loading calendar...</div>;
  if (!user || !profile) return <div className="p-6">Please sign in first.</div>;

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <div className="opennest-topbar">
          <div className="opennest-topbar-title">Family Calendar</div>

          <div className="opennest-topbar-links">
            <Link href="/">Home</Link>
            <Link href="/feed">Feed</Link>
          </div>
        </div>
c
        <FamilyCalendarFilters
          selectedModule={selectedModule}
          onModuleChange={(value) => updateQuery({ module: value, offset: 0 })}
          userOptions={familyUsers}
          selectedUserUid={selectedUserUid as string | "all"}
          onUserChange={(value) => updateQuery({ user: value })}
          currentOffset={offset}
        />

        <div className="max-w-screen-sm mx-auto px-3 pb-3 flex items-center justify-between text-sm">
          {offset > 0 ? (
            <button
              type="button"
              onClick={() => updateQuery({ offset: offset - 1 })}
              className="underline"
            >
              Previous
            </button>
          ) : (
            <span className="text-gray-400">Previous</span>
          )}

          {offset < 4 ? (
            <button
              type="button"
              onClick={() => updateQuery({ offset: offset + 1 })}
              className="underline"
            >
              Next
            </button>
          ) : (
            <span className="text-gray-400">Next</span>
          )}
        </div>

        {selectedModule === "studies" && (
          <StudiesFamilyCalendar
            items={studiesItems}
            year={monthRange.year}
            month={monthRange.month}
          />
        )}
  
       {selectedModule === "reading" && (
        <ReadingFamilyCalendar
          items={readingItems.map((item: any) => ({
            id: item.id,
            authorUid: item.authorUid || "",
            authorName: item.authorName || "Unknown",
            title: item.title || "Reading",
            status: item.status || "",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            createdAt: item.createdAt || 0,
            href: `/entry/reading/${item.id}`,
          }))}
            year={monthRange.year}
            month={monthRange.month}
          />
        )}

        {selectedModule === "internship" && (
          <InternshipFamilyCalendar
            items={internshipItems.map((item: any) => ({
              id: item.id,
              authorUid: item.authorUid || "",
              authorName: item.authorName || "Unknown",
              company: item.company || "Internship",
              status: item.status || "",
              milestone: item.milestone || "",
              blocker: item.blocker || "",
              startDate: item.startDate || "",
              endDate: item.endDate || "",
              href: `/entry/internship/${item.id}`,
      }))}
            year={monthRange.year}
            month={monthRange.month}
          />
        )}

       {selectedModule === "reflection" && (
          <ReflectionFamilyCalendar
            items={reflectionItems.map((item: any) => ({
              id: item.id,
              authorUid: item.authorUid || "",
              authorName: item.authorName || "Unknown",
              authorRelationship: item.authorRelationship || "",
              highlight: item.highlight || "",
              challenge: item.challenge || "",
              mood: item.mood || "",
              needType: item.needType || "",
              visibility: item.visibility || "",
              createdAt: item.createdAt || 0,
              href: `/entry/reflection/${item.id}`,
            }))}
            year={monthRange.year}
            month={monthRange.month}
          />
        )}
      </div>
    </div>
  );
}