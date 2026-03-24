"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { saveReflection } from "@/lib/reflections";
import PageHeader from "@/components/PageHeader";
import { VisibilityScope } from "@/types/reflection";

export default function ReflectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const [mood, setMood] = useState("");
  const [highlight, setHighlight] = useState("");
  const [challenge, setChallenge] = useState("");
  const [needType, setNeedType] = useState("listening");
  const [visibility, setVisibility] = useState<VisibilityScope>("everyone");
  const [message, setMessage] = useState("");
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
        setProfile(userProfile);
      } catch (error) {
        console.error("Failed to load user profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  async function handleSubmit() {
    if (!user || !profile) {
      setMessage("Please complete your login setup first.");
      return;
    }

    if (!mood.trim() && !highlight.trim() && !challenge.trim()) {
      setMessage("Please add at least one reflection field.");
      return;
    }

    try {
      await saveReflection({
        familyId: profile.familyId,
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        authorRelationship: profile.relationship,
        mood,
        highlight,
        challenge,
        needType,
        visibility,
        createdAt: Date.now(),
      });

      setMessage("Reflection saved.");
      setMood("");
      setHighlight("");
      setChallenge("");
      setNeedType("listening");
      setVisibility("everyone");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save reflection.");
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Reflection" />

      <div className="p-6 max-w-xl mx-auto">
        <input
          className="border p-2 w-full mb-3"
          placeholder="Mood"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Highlight"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
        />

        <textarea
          className="border p-2 w-full mb-3"
          placeholder="Challenge"
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
        />

        <select
          className="border p-2 w-full mb-3"
          value={needType}
          onChange={(e) => setNeedType(e.target.value)}
        >
          <option value="listening">Listening</option>
          <option value="advice">Advice</option>
          <option value="space">Space</option>
          <option value="celebrate">Celebrate</option>
          <option value="practical">Practical Help</option>
        </select>

        <select
          className="border p-2 w-full mb-3"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as VisibilityScope)}
        >
          <option value="everyone">Everyone</option>
          <option value="parentsOnly">Parents only</option>
          <option value="siblingOnly">Sibling only</option>
          <option value="onlyMe">Only me</option>
        </select>

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Post Reflection
        </button>

        {message && <p className="mt-4">{message}</p>}
      </div>
    </div>
  );
}