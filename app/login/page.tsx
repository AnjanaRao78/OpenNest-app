"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, getUserProfile } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function handleGoogleSignIn() {
    try {
      const user = await signInWithGoogle();
      const profile = await getUserProfile(user.uid);

      if (profile) {
        router.push("/");
      } else {
        router.push("/onboarding");
      }
    } catch (error) {
      console.error(error);
      setStatus("Sign-in failed.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-3">OpenNest</h1>
        <p className="text-neutral-300 mb-6">
          Sign in to join your family space.
        </p>

        <button
          onClick={handleGoogleSignIn}
          className="w-full rounded-xl px-4 py-3 bg-white text-black font-medium"
        >
          Continue with Google
        </button>

        {status && <p className="mt-4 text-sm text-neutral-300">{status}</p>}
      </div>
    </div>
  );
}