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
        setLoading(false);
        return;
      }

      const userProfile = await getUserProfile(authUser.uid);

      if (!userProfile) {
        router.push("/onboarding");
        return;
      }

      setProfile(userProfile);
      setLoading(false);
    });

    return () => unsub();
  }, [router]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return (
      <div className="p-6">
        <Link href="/login" className="underline">
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">OpenNest</h1>
      <p className="mb-1">Signed in as {user.displayName}</p>
      {profile && (
        <p className="mb-4 text-sm text-gray-600">
          Family role: {profile.relationship}
        </p>
      )}

      <div className="space-y-3">
        <Link href="/reflection" className="block underline">Reflection</Link>
        <Link href="/feed" className="block underline">Feed</Link>
        <Link href="/studies" className="block underline">Classes</Link>
        <Link href="/internship" className="block underline">Internship</Link>
        <Link href="/reading" className="block underline">Reading</Link>
        <Link href="/hobbies" className="block underline">Hobbies</Link>
        <Link href="/calendar" className="block underline">Calendar</Link>
      </div>

      <button
        onClick={logOut}
        className="mt-6 px-4 py-2 rounded bg-black text-white"
      >
        Log out
      </button>
    </div>
  );
}