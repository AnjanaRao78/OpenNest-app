"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToAuth } from "@/lib/auth";
import EditPageShell from "@/components/EditPageShell";

import { saveReadingEntry, loadReadingByAuthor } from "@/lib/reading";

export default function EditReadingPage() {
  const { id } = useParams();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [title, setTitle] = useState("");
  const [statusValue, setStatusValue] = useState("to-read");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function load() {
      const snap = await getDoc(doc(db, "reading", id as string));
      if (!snap.exists()) return;

      const d = snap.data();

      setTitle(d.title || "");
      setStatusValue(d.status || "to-read");
      setNotes(d.notes || "");
      setStartDate(d.startDate || "");
      setEndDate(d.endDate || "");
    }

    load();
    return () => unsub();
  }, [id]);

  async function handleSave() {
    if (!user) return;

    const ref = doc(db, "reading", id as string);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;
    if (snap.data().authorUid !== user.uid) {
      setStatusMessage("You can only edit your own entry.");
      return;
    }

    await updateDoc(ref, {
      title,
      status: statusValue,
      notes,
      startDate,
      endDate,
    });

    router.push(`/entry/reading/${id}`);
  }

  return (
    <EditPageShell
      title="Edit Reading"
      onSave={handleSave}
      cancelHref={`/entry/reading/${id}`}
      statusMessage={statusMessage}
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <select value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
        <option value="to-read">To Read</option>
        <option value="reading">Reading</option>
        <option value="finished">Finished</option>
      </select>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
    </EditPageShell>
  );
}