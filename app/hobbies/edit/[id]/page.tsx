"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToAuth } from "@/lib/auth";
import EditPageShell from "@/components/EditPageShell";

export default function EditHobbyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [hobbyName, setHobbyName] = useState("");
  const [frequencyGoal, setFrequencyGoal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function load() {
      const snap = await getDoc(doc(db, "hobbies", id as string));
      if (!snap.exists()) return;

      const d = snap.data();
      setHobbyName(d.hobbyName || "");
      setFrequencyGoal(d.frequencyGoal || "");
      setStartDate(d.startDate || "");
      setEndDate(d.endDate || "");
    }

    load();
    return () => unsub();
  }, [id]);

  async function handleSave() {
    const ref = doc(db, "hobbies", id as string);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;
    if (snap.data().authorUid !== user?.uid) {
      setStatusMessage("Not allowed.");
      return;
    }

    await updateDoc(ref, {
      hobbyName,
      frequencyGoal,
      startDate,
      endDate,
    });

    router.push(`/entry/hobbies/${id}`);
  }

  return (
    <EditPageShell
      title="Edit Hobby"
      onSave={handleSave}
      cancelHref={`/entry/hobbies/${id}`}
      statusMessage={statusMessage}
    >
      <input value={hobbyName} onChange={(e) => setHobbyName(e.target.value)} />
      <input value={frequencyGoal} onChange={(e) => setFrequencyGoal(e.target.value)} />
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
    </EditPageShell>
  );
}