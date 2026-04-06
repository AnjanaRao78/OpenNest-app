"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile, logOut } from "@/lib/auth";
import { loadReadingByAuthor } from "@/lib/reading";
import { loadStudiesByAuthor } from "@/lib/studies";
import { loadHobbiesByAuthor } from "@/lib/hobbies";
import { loadInternshipsByAuthor } from "@/lib/internship";
import { loadReflections } from "@/lib/reflections";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [readingCount, setReadingCount] = useState(0);
  const [studiesCount, setStudiesCount] = useState(0);
  const [hobbiesCount, setHobbiesCount] = useState(0);
  const [internshipCount, setInternshipCount] = useState(0);
  const [familyReflectionCount, setFamilyReflectionCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setReadingCount(0);
        setStudiesCount(0);
        setHobbiesCount(0);
        setInternshipCount(0);
        setFamilyReflectionCount(0);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(authUser.uid);
        setProfile(userProfile);

        if (!userProfile) {
          setLoading(false);
          return;
        }

        const familyId = (userProfile as any)?.familyId;

        const [reading, studies, hobbies, internships, reflections] =
          await Promise.all([
            loadReadingByAuthor(authUser.uid),
            loadStudiesByAuthor(authUser.uid),
            loadHobbiesByAuthor(authUser.uid, familyId),
            loadInternshipsByAuthor(authUser.uid),
            loadReflections(familyId),
          ]);

        setReadingCount(reading.length);
        setStudiesCount(studies.length);
        setHobbiesCount(hobbies.length);
        setInternshipCount(internships.length);
        setFamilyReflectionCount(reflections.length);
      } catch (error) {
        console.error("Failed to load home dashboard:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const greeting = useMemo(() => {
    if (!user?.displayName) return "Welcome";
    const first = user.displayName.split(" ")[0];
    return `Welcome, ${first}`;
  }, [user]);

  if (loading) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <HeroHeader />
          <div className="opennest-card">
            <div className="opennest-card-subtitle">Loading your nest...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <HeroHeader />

          <div className="opennest-hero-card" style={{ marginBottom: 18 }}>
            <div className="opennest-card-title">
              Stay close, even when life stretches the map
            </div>
            <div className="opennest-card-subtitle">
              OpenNest is a shared family space for reflections, courses, reading,
              routines, milestones, and the quiet details that help people feel
              near each other.
            </div>
          </div>

          <div className="opennest-section">
            <DashboardCard title="Get started">
              <div className="opennest-list">
                <div className="opennest-list-card teal">
                  <div className="opennest-list-title">Enter your family space</div>
                  <div className="opennest-list-meta">
                    Sign in, choose your family, and begin sharing life in a more
                    structured and thoughtful way.
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <Link href="/login" className="opennest-button opennest-button-primary">
                      Go to Login
                    </Link>
                  </div>
                </div>

                <div className="opennest-list-card gold">
                  <div className="opennest-list-title">Explore the calendar</div>
                  <div className="opennest-list-meta">
                    View family schedules one module at a time with designs tailored
                    for courses, reading, internships, and reflections.
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <Link href="/calendar" className="opennest-button opennest-button-secondary">
                      Open Family Calendar
                    </Link>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    );
  }

  if (user && !profile) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <HeroHeader />

          <div className="opennest-hero-card" style={{ marginBottom: 18 }}>
            <div className="opennest-card-title">{greeting}</div>
            <div className="opennest-card-subtitle">
              Your account is ready. Your family setup is the next step.
            </div>
          </div>

          <DashboardCard title="Complete setup">
            <div className="opennest-list">
              <div className="opennest-list-card teal">
                <div className="opennest-list-title">Choose or create your family</div>
                <div className="opennest-list-meta">
                  Set your family group and relationship so OpenNest can show the
                  right shared space and visibility.
                </div>

                <div
                  style={{
                    marginTop: 14,
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <Link href="/family" className="opennest-button opennest-button-primary">
                    Family Setup
                  </Link>
                  <button
                    type="button"
                    onClick={logOut}
                    className="opennest-button opennest-button-secondary"
                  >
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    );
  }

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <HeroHeader />

        <div className="opennest-hero-card" style={{ marginBottom: 18 }}>
          <div className="opennest-card-title">{greeting}</div>
          <div className="opennest-card-subtitle">
            A shared place for family rhythm — courses, reading, reflections,
            routines, milestones, and the small signals that make better
            conversations possible.
          </div>
        </div>

        <div className="opennest-summary-grid">
          <SummaryCard label="Family Reflections" value={familyReflectionCount} />
          <SummaryCard label="My Courses" value={studiesCount} />
          <SummaryCard label="My Reading" value={readingCount} />
          <SummaryCard label="My Hobbies" value={hobbiesCount} />
        </div>

        <div className="opennest-module-grid">
          <div className="opennest-section">
            <DashboardCard title="Continue">
              <div className="opennest-list">
                <div className="opennest-list-card teal">
                  <div className="opennest-list-title">Family Calendar</div>
                  <div className="opennest-list-meta">
                    Open one module at a time and view it across family members.
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/calendar" className="underline text-sm">
                      Open Calendar
                    </Link>
                  </div>
                </div>

                <div className="opennest-list-card gold">
                  <div className="opennest-list-title">Feed</div>
                  <div className="opennest-list-meta">
                    See recent family reflections and emotional signals.
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/feed" className="underline text-sm">
                      Open Feed
                    </Link>
                  </div>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Your modules">
              <div className="opennest-list">
                <div className="opennest-list-card opennest-module-accent-studies">
                  <div className="opennest-list-title">Courses</div>
                  <div className="opennest-list-meta">
                    Courses registered: {studiesCount}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/studies" className="underline text-sm">
                      Open Courses
                    </Link>
                  </div>
                </div>

                <div className="opennest-list-card opennest-module-accent-reading">
                  <div className="opennest-list-title">Reading</div>
                  <div className="opennest-list-meta">
                    Reading entries: {readingCount}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/reading" className="underline text-sm">
                      Open Reading
                    </Link>
                  </div>
                </div>

                <div className="opennest-list-card opennest-module-accent-hobbies">
                  <div className="opennest-list-title">Hobbies</div>
                  <div className="opennest-list-meta">
                    Hobbies tracked: {hobbiesCount}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/hobbies" className="underline text-sm">
                      Open Hobbies
                    </Link>
                  </div>
                </div>

                <div className="opennest-list-card opennest-module-accent-internship">
                  <div className="opennest-list-title">Internship</div>
                  <div className="opennest-list-meta">
                    Internship items: {internshipCount}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Link href="/internship" className="underline text-sm">
                      Open Internship
                    </Link>
                  </div>
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="opennest-section">
            <DashboardCard title="Your family profile">
              <div className="opennest-meta-grid">
                <div>
                  <strong>Name:</strong> {user.displayName || "-"}
                </div>
                <div>
                  <strong>Relationship:</strong> {profile?.relationship || "-"}
                </div>
                <div>
                <strong>Family:</strong>{" "}
                {profile?.familyName
                  ? profile.familyName
                  : profile?.familyId
                  ? ` ${profile.familyId}`
                  : "-"}
              </div>
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <Link href="/family" className="opennest-button opennest-button-secondary">
                  Family Settings
                </Link>
                <button
                  type="button"
                  onClick={logOut}
                  className="opennest-button opennest-button-secondary"
                >
                  Log out
                </button>
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function HeroHeader() {
  return (
    <div
      style={{
        display: "grid",
        justifyItems: "center",
        textAlign: "center",
        marginBottom: 22,
        paddingTop: 8,
        background: "linear-gradient(180deg, #F6F5F0 0%, #EFEEE9 100%)" ,
      }}
    >
      <img
        src="/opennest-logo.png"
        alt="OpenNest"
        style={{
          width: '8 px',
          height: '8 px',
          objectFit: "contain",
          marginBottom: 12,
          
        }}
      />

      
      <div
        style={{
          fontSize: 15,
          lineHeight: 1.5,
          justifyItems: "center",
          color: "var(--on-text-soft)",
          maxWidth: 540,
        }}
      >
        A shared family space for reflection, rhythm, and the threads of daily life.
      </div>
    </div>
  );
}