"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile, logOut } from "@/lib/auth";
import { loadReadingByAuthor } from "@/lib/reading";
import { loadStudiesByAuthor } from "@/lib/studies";
import { loadHobbiesByAuthor } from "@/lib/hobbies";
import { loadInternshipsByAuthor } from "@/lib/internship";
import { loadReflectionsForHome } from "@/lib/reflections";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

type HomeTile = {
  key: string;
  label: string;
  href: string;
  image: string;
  count: number;
};

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [readingCount, setReadingCount] = useState(0);
  const [studiesCount, setStudiesCount] = useState(0);
  const [hobbiesCount, setHobbiesCount] = useState(0);
  const [internshipCount, setInternshipCount] = useState(0);
  const [reflectionCount, setReflectionCount] = useState(0);

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setReadingCount(0);
        setStudiesCount(0);
        setHobbiesCount(0);
        setInternshipCount(0);
        setReflectionCount(0);
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

        const hasCompleteProfile =
          !!userProfile.familyId && !!userProfile.relationship;

        if (!hasCompleteProfile) {
          setLoading(false);
          return;
        }

        const familyId = userProfile.familyId;

        const [reading, studies, hobbies, internships, reflections] =
          await Promise.all([
            loadReadingByAuthor(authUser.uid, familyId),
            loadStudiesByAuthor(authUser.uid, familyId),
            loadHobbiesByAuthor(authUser.uid, familyId),
            loadInternshipsByAuthor(authUser.uid, familyId),
            loadReflectionsForHome(
              familyId,
              authUser.uid,
              userProfile.relationship
            ),
          ]);

        setReadingCount(reading.length);
        setStudiesCount(studies.length);
        setHobbiesCount(hobbies.length);
        setInternshipCount(internships.length);
        setReflectionCount(reflections.length);
      } catch (error) {
        console.error("Failed to load home dashboard:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (
      user &&
      !loading &&
      (!profile || !profile.familyId || !profile.relationship)
    ) {
      router.replace("/family");
    }
  }, [user, loading, profile, router]);

  const greeting = useMemo(() => {
    if (!user?.displayName) return "Welcome";
    return `Welcome, ${user.displayName.split(" ")[0]}`;
  }, [user]);

  const dailyMessage = useMemo(() => {
    const messages = [
      "Small moments, shared gently, become family memory.",
      "A calm word at the right time can change the whole day.",
      "Even busy nests stay connected through small signals.",
      "Progress is quieter than noise, but it lasts longer.",
      "Today is a good day to notice, listen, and encourage.",
      "Families grow stronger in the ordinary moments.",
      "A thoughtful check-in can be its own kind of gift.",
    ];

    const dayIndex = new Date().getDate() % messages.length;
    return messages[dayIndex];
  }, []);

  const tiles: HomeTile[] = [

     {
      key: "reflection",
      label: "Reflection",
      href: "/reflection",
      image: "/images/home-reflection.jpeg",
      count: reflectionCount,
    },
    
    {
      key: "classes",
      label: "Classes",
      href: "/studies",
      image: "/images/home-classes.jpeg",
      count: studiesCount,
    },

      {
      key: "internships",
      label: "Internships",
      href: "/internship",
      image: "/images/home-internships.jpeg",
      count: internshipCount,
    },
    
    {
      key: "reading",
      label: "Reading",
      href: "/reading",
      image: "/images/home-reading.jpeg",
      count: readingCount,
    },
    {
      key: "hobbies",
      label: "Hobbies",
      href: "/hobbies",
      image: "/images/home-hobbies.jpeg",
      count: hobbiesCount,
    },
  
   
  ];

  if (loading) {
    return (
      <div className="opennest-home-shell">
        <div className="opennest-home-loading">Loading your nest...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="opennest-home-shell">
        <div className="opennest-home-guest">
          <Image
            src="/opennest-logo.png"
            alt="OpenNest"
            width={140}
            height={80}
            priority
          />

          <h1 className="opennest-home-title">OpenNest</h1>
          <p className="opennest-home-subtitle">
            A shared family space for reflection, rhythm, and the threads of daily life.
          </p>

          <Link href="/login" className="opennest-home-primary-button">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (user && (!profile || !profile.familyId || !profile.relationship)) {
    return (
      <div className="opennest-home-shell">
        <div className="opennest-home-guest">
          <h1 className="opennest-home-title">{greeting}</h1>
          <p className="opennest-home-subtitle">
            Redirecting you to family setup...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="opennest-home-shell">
      <div className="opennest-home-container">
        <div className="opennest-home-topbar">
          <div>
            <div className="opennest-home-title">{greeting}</div>
            <div className="opennest-home-family">
              {profile?.familyName || profile?.familyId || "Your Family"}
            </div>
          </div>

          <button
            type="button"
            onClick={logOut}
            className="opennest-home-secondary-button"
          >
            Log out
          </button>
        </div>

        <div className="opennest-home-message-card">
          <div className="opennest-home-message-label">Daily family message</div>
          <div className="opennest-home-message-text">{dailyMessage}</div>
        </div>

        <div className="opennest-home-grid">
          {tiles.map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="opennest-home-tile"
            >
              <div className="opennest-home-image-wrap">
                <Image
                  src={tile.image}
                  alt={tile.label}
                  fill
                  sizes="(max-width: 768px) 55vw, 33vw"
                  className="opennest-home-image"
                />
              </div>

              <div className="opennest-home-tile-footer">
                <div className="opennest-home-tile-title">{tile.label}</div>
                <div className="opennest-home-count">{tile.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}