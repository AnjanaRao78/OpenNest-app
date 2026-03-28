"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/types/firebase1";
import { subscribeToAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

export default function EditReflectionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [mood, setMood] = useState("");
  const [highlight, setHighlight] = useState("");
  const [challenge, setChallenge] = useState("");
  const [needType, setNeedType] = useState("listening");
  const [visibility, setVisibility] = useState("everyone");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function loadEntry() {
      try {
        const ref = doc(db, "reflections", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setStatus("Reflection not found.");
          setLoading(false);
          return;
        }

        const data = snap.data();

        setMood(data.mood || "");
        setHighlight(data.highlight || "");
        setChallenge(data.challenge || "");
        setNeedType(data.needType || "listening");
        setVisibility(data.visibility || "everyone");
        setLoading(false);
      } catch (error) {
        console.error(error);
        setStatus("Failed to load reflection.");
        setLoading(false);
      }
    }

    loadEntry();
    return () => unsub();
  }, [id]);

  async function handleSave() {
    if (!user) {
      setStatus("Please sign in first.");
      return;
    }

    try {
      const ref = doc(db, "reflections", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setStatus("Reflection not found.");
        return;
      }

      const data = snap.data();

      if (data.authorUid !== user.uid) {
        setStatus("You can only edit your own reflection.");
        return;
      }

      await updateDoc(ref, {
        mood,
        highlight,
        challenge,
        needType,
        visibility,
      });

      router.push(`/entry/reflection/${id}`);
    } catch (error) {
      console.error(error);
      setStatus("Failed to save changes.");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border bg-white shadow p-6">
        <PageHeader title="Edit Reflection" />

        <input
          className="border p-2 w-full mb-3"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Mood"
        />

        <textarea
          className="border p-2 w-full mb-3"
          value={highlight}
          onChange={(e) => setHighlight(e.target.value)}
          placeholder="Highlight"
        />

        <textarea
          className="border p-2 w-full mb-3"
          value={challenge}
          onChange={(e) => setChallenge(e.target.value)}
          placeholder="Challenge"
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
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="everyone">Everyone</option>
          <option value="parentsOnly">Parents only</option>
          <option value="siblingOnly">Sibling only</option>
          <option value="onlyMe">Only me</option>
        </select>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push(`/entry/reflection/${id}`)}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>

        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </div>
  );
}