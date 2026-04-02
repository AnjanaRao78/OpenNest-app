// app/reflection/edit/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToAuth } from "@/lib/auth";
import EditPageShell from "@/components/EditPageShell";

export default function EditReflectionPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);

  const [mood, setMood] = useState("");
  const [highlight, setHighlight] = useState("");
  const [challenge, setChallenge] = useState("");
  const [needType, setNeedType] = useState("");
  const [visibility, setVisibility] = useState("everyone");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function load() {
      const snap = await getDoc(doc(db, "reflections", id as string));
      if (!snap.exists()) return;

      const d = snap.data();

      setMood(d.mood || "");
      setHighlight(d.highlight || "");
      setChallenge(d.challenge || "");
      setNeedType(d.needType || "");
      setVisibility(d.visibility || "everyone");
    }

    load();
    return () => unsub();
  }, [id]);

  async function handleSave() {
    const ref = doc(db, "reflections", id as string);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;
    if (snap.data().authorUid !== user?.uid) return;

    await updateDoc(ref, {
      mood,
      highlight,
      challenge,
      needType,
      visibility,
    });

    router.push(`/entry/reflection/${id}`);
  }

  return (
    <EditPageShell
      title="Edit Reflection"
      onSave={handleSave}
      cancelHref={`/entry/reflection/${id}`}
    >
      <input value={mood} onChange={(e) => setMood(e.target.value)} placeholder="Mood" />
      <textarea value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="Highlight" />
      <textarea value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="Challenge" />
      <input value={needType} onChange={(e) => setNeedType(e.target.value)} placeholder="Need" />

      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="everyone">Everyone</option>
        <option value="parentsOnly">Parents Only</option>
        <option value="siblingOnly">Sibling Only</option>
        <option value="onlyMe">Only Me</option>
      </select>
    </EditPageShell>
  );
}