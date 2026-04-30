"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import HobbyFamilyCalendar, {
  HobbyCalendarItem,
} from "@/components/HobbyFamilyCalendar";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadHobbiesByFamily, HobbyEntry } from "@/lib/hobbies";

type UserProfile = {
  uid: string;
  familyId: string;
  familyName?: string;
  relationship: "parent" | "sibling" | "child";
};

export default function HobbiesCalendarPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<HobbyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const today = new Date();
  const [monthRange, setMonthRange] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setEntries([]);
        setLoading(false);
        return;
      }

      try {
        const userProfile = (await getUserProfile(authUser.uid)) as UserProfile | null;
        setProfile(userProfile);

        if (!userProfile?.familyId) {
          setEntries([]);
          setLoading(false);
          return;
        }

        const hobbyData = await loadHobbiesByFamily(userProfile.familyId);
        setEntries(hobbyData);
      } catch (error) {
        console.error("Failed to load family hobby calendar:", error);
        setMessage("Failed to load family hobby calendar.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const calendarItems = useMemo<HobbyCalendarItem[]>(() => {
    return entries
      .filter((entry) => entry.startDate)
      .map((entry) => ({
        id: entry.id || "",
        title: entry.title || entry.hobbyName || "Untitled Hobby",
        authorName: entry.authorName || "Unknown",
        status: entry.status || "planned",
        startDate: entry.startDate,
        targetEndDate: entry.targetEndDate,
        completedDate: entry.completedDate,
        href: `/entry/hobbies/${entry.id}`,
      }));
  }, [entries]);

  const monthLabel = useMemo(() => {
    return new Date(monthRange.year, monthRange.month, 1).toLocaleDateString(
      undefined,
      { month: "long", year: "numeric" }
    );
  }, [monthRange]);

  function goPreviousMonth() {
    setMonthRange((prev) => {
      const nextMonth = prev.month - 1;
      if (nextMonth < 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: nextMonth };
    });
  }

  function goNextMonth() {
    setMonthRange((prev) => {
      const nextMonth = prev.month + 1;
      if (nextMonth > 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: nextMonth };
    });
  }

  if (loading) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="Family Hobby Calendar" />
          <div className="opennest-card">Loading hobby calendar...</div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="Family Hobby Calendar" />
          <div className="opennest-card">
            Please sign in to use the family hobby calendar.
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile?.familyId) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="Family Hobby Calendar" />
          <div className="opennest-card">
            Complete family setup before using the family hobby calendar.
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Family Hobby Calendar" />

        <div className="opennest-hero-card" style={{ marginBottom: 16 }}>
          <div className="opennest-card-title">Shared hobby month view</div>
          <div className="opennest-card-subtitle">
            See how hobbies unfold across the month for the whole family.
          </div>
        </div>

        <div className="opennest-card" style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={goPreviousMonth}
              className="opennest-button opennest-button-secondary"
            >
              Previous
            </button>

            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              {monthLabel}
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              className="opennest-button opennest-button-secondary"
            >
              Next
            </button>
          </div>
        </div>

        <HobbyFamilyCalendar
          items={calendarItems}
          year={monthRange.year}
          month={monthRange.month}
        />

        {message && (
          <div className="opennest-card" style={{ marginTop: 16 }}>
            <div className="opennest-list-meta">{message}</div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}