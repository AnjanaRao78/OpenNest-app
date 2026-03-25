"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile, logOut } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(authUser.uid);

        if (!userProfile) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setProfile(userProfile);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  function renderContent() {
    if (loading) {
      return (
        <>
          <h1 className="text-4xl font-bold tracking-tight text-amber-950">
            OpenNest
          </h1>
          <p className="mt-4 text-sm text-slate-700">
            Waking up the nest...
          </p>
        </>
      );
    }

    if (!user) {
      return (
        <>
          <h1 className="text-4xl font-bold tracking-tight text-amber-950">
            OpenNest
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            A shared family space for reflections, routines, milestones, and
            the small everyday details that make conversations warmer and more
            meaningful.
          </p>

          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mt-6 mb-6">
            <p className="text-sm text-amber-900 leading-6">
              Stay close even when life stretches the map. Sign in to enter your
              family space, share updates, and keep your calendar of shared life
              in view.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full rounded-2xl px-4 py-3.5 bg-amber-900 text-white font-medium shadow-md hover:bg-amber-950 transition text-center"
            >
              Login with Gmail
            </Link>

            <Link
              href="/calendar"
              className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
            >
              View Calendar
            </Link>
          </div>

          <p className="mt-4 text-xs text-center text-slate-500">
            Built for families living apart, thinking together.
          </p>
        </>
      );
    }

    if (user && !profile) {
      return (
        <>
          <h1 className="text-4xl font-bold tracking-tight text-amber-950">
            Welcome back, {user.displayName || "there"}
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-700">
            Your account is signed in, but your family profile is not complete
            yet.
          </p>

          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mt-6 mb-6">
            <p className="text-sm text-amber-900 leading-6">
              Choose or create your family and select your family member type to
              continue into OpenNest.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/onboarding"
              className="block w-full rounded-2xl px-4 py-3.5 bg-amber-900 text-white font-medium shadow-md hover:bg-amber-950 transition text-center"
            >
              Complete Family Setup
            </Link>

            <button
              onClick={logOut}
              className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
            >
              Log out
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <h1 className="text-4xl font-bold tracking-tight text-amber-950">
          OpenNest
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-700">
          Welcome back, <span className="font-medium">{user.displayName}</span>.
          Your family space is ready.
        </p>

        <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mt-6 mb-6 text-left">
          <p className="text-sm text-amber-900 leading-6">
            <strong>Family role:</strong> {profile?.relationship}
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/reflection"
            className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
          >
            Reflection
          </Link>

          <Link
            href="/feed"
            className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
          >
            Feed
          </Link>

            <Link
            href="/studies"
            className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
          >
            Classes
          </Link>

            <Link
            href="/internship"
            className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
          >
            Internship
          </Link>

            <Link
            href="/reading"
            className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
          >
            Reading
          </Link>

            <Link
            href="/hobbies"
            className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
          >
            Hobbies
          </Link>

          <Link
            href="/calendar"
            className="block w-full rounded-2xl px-4 py-3 border border-amber-300 text-amber-950 font-medium hover:bg-amber-50 transition text-center"
          >
            Calendar
          </Link>

          <button
            onClick={logOut}
            className="block w-full rounded-2xl px-4 py-3.5 bg-amber-900 text-white font-medium shadow-md hover:bg-amber-950 transition text-center"
          >
            Log out
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100 relative">
      {/* Animated clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="cloud cloud-1 absolute top-12 left-8 h-16 w-32 rounded-full bg-white/60 blur-xl" />
        <div className="cloud cloud-2 absolute top-24 right-12 h-20 w-40 rounded-full bg-white/50 blur-xl" />
        <div className="cloud cloud-3 absolute top-40 left-1/3 h-14 w-28 rounded-full bg-white/50 blur-xl" />
      </div>

      {/* Animated birds */}
      <div className="bird bird-1 absolute top-14 left-10 text-slate-600/70 text-2xl rotate-[-8deg]">
        ∿ ∿
      </div>
      <div className="bird bird-2 absolute top-24 right-20 text-slate-600/60 text-3xl rotate-[6deg]">
        ∿ ∿ ∿
      </div>
      <div className="bird bird-3 absolute top-40 left-1/4 text-slate-600/50 text-xl">
        ∿ ∿
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          {/* Nest illustration */}
          <div className="flex justify-center mb-6">
            <div className="nest-wrap relative h-40 w-40">
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-16 rounded-[999px] border-[6px] border-amber-800 bg-amber-200/80 shadow-lg" />
              <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-28 h-12 rounded-[999px] border-[5px] border-amber-700 bg-amber-100/90" />

              <div className="absolute bottom-11 left-[42px] h-7 w-5 rounded-full bg-rose-100 border border-amber-700 rotate-[-8deg]" />
              <div className="absolute bottom-12 left-[60px] h-7 w-5 rounded-full bg-sky-100 border border-amber-700 rotate-[4deg]" />
              <div className="absolute bottom-11 left-[79px] h-7 w-5 rounded-full bg-emerald-100 border border-amber-700 rotate-[10deg]" />

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-40 rounded-full bg-amber-900" />
            </div>
          </div>

          {/* Card */}
          <div className="home-card rounded-3xl border border-amber-200/70 bg-white/85 backdrop-blur-md shadow-2xl px-7 py-8 text-center">
            {renderContent()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .cloud-1 {
          animation: driftCloud1 18s ease-in-out infinite;
        }

        .cloud-2 {
          animation: driftCloud2 22s ease-in-out infinite;
        }

        .cloud-3 {
          animation: driftCloud3 20s ease-in-out infinite;
        }

        .bird-1 {
          animation: glideBird1 12s ease-in-out infinite;
        }

        .bird-2 {
          animation: glideBird2 16s ease-in-out infinite;
        }

        .bird-3 {
          animation: glideBird3 14s ease-in-out infinite;
        }

        .nest-wrap {
          animation: floatNest 5s ease-in-out infinite;
        }

        .home-card {
          animation: breatheCard 6s ease-in-out infinite;
        }

        @keyframes driftCloud1 {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(12px) translateY(4px);
          }
        }

        @keyframes driftCloud2 {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(-14px) translateY(6px);
          }
        }

        @keyframes driftCloud3 {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(10px) translateY(-4px);
          }
        }

        @keyframes glideBird1 {
          0%, 100% {
            transform: translateX(0px) translateY(0px) rotate(-8deg);
          }
          50% {
            transform: translateX(14px) translateY(-6px) rotate(-5deg);
          }
        }

        @keyframes glideBird2 {
          0%, 100% {
            transform: translateX(0px) translateY(0px) rotate(6deg);
          }
          50% {
            transform: translateX(-10px) translateY(-5px) rotate(2deg);
          }
        }

        @keyframes glideBird3 {
          0%, 100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(8px) translateY(-4px);
          }
        }

        @keyframes floatNest {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes breatheCard {
          0%, 100% {
            transform: translateY(0px);
            box-shadow: 0 20px 45px rgba(0, 0, 0, 0.12);
          }
          50% {
            transform: translateY(-3px);
            box-shadow: 0 24px 52px rgba(0, 0, 0, 0.14);
          }
        }
      `}</style>
    </div>
  );
}