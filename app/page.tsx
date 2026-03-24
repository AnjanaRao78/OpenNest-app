"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeToAuth, logOut } from "@/lib/auth";
import { User } from "firebase/auth";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return () => unsub();
  }, []);

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
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-3">Open Nest </h1>
      <p className="mb-6">Signed in as {user.displayName}</p>

      <div className="space-y-3">
        <Link href="/reflection" className="block underline">Reflection</Link>
        <Link href="/studies" className="block underline">Studies</Link>
        <Link href="/reading" className="block underline">Reading</Link>
        <Link href="/hobbies" className="block underline">Hobbies</Link>
        <Link href="/internship" className="block underline">Internship</Link>
        <Link href="/calendar" className="block underline">Calendar</Link>
      </div>

      <button onClick={logOut} className="mt-6 px-4 py-2 rounded bg-black text-white">
        Log out
      </button>
    </div>
  );
}