"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/types/firebase1";
import { subscribeToAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

export default function EditReadingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const [title, setTitle] = useState("");
  const [statusValue, setStatusValue] = useState("to-read");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function loadEntry() {
      try {
        const ref = doc(db, "reading", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setStatusMessage("Reading entry not found.");
          setLoading(false);
          return;
        }

        const data = snap.data();

        setTitle(data.title || "");
        setStatusValue(data.status || "to-read");
        setNotes(data.notes || "");
        setStartDate(data.startDate || "");
        setLoading(false);
      } catch (error) {
        console.error(error);
        setStatusMessage("Failed to load reading entry.");
        setLoading(false);
      }
    }

    loadEntry();
    return () => unsub();
  }, [id]);

  async function handleSave() {
    if (!user) {
      setStatusMessage("Please sign in first.");
      return;
    }

    try {
      const ref = doc(db, "reading", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setStatusMessage("Reading entry not found.");
        return;
      }

      const data = snap.data();

      if (data.authorUid !== user.uid) {
        setStatusMessage("You can only edit your own reading entry.");
        return;
      }

      await updateDoc(ref, {
        title,
        status: statusValue,
        notes,
        startDate,
      });

      router.push(`/entry/reading/${id}`);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to save changes.");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border bg-white shadow p-6">
        <PageHeader title="Edit Reading Entry" />

        <input
          className="border p-2 w-full mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Book or article title"
        />

        <select
          className="border p-2 w-full mb-3"
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
        >
          <option value="to-read">To Read</option>
          <option value="reading">Reading</option>
          <option value="finished">Finished</option>
        </select>

        <textarea
          className="border p-2 w-full mb-3"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
        />

        <input
          type="date"
          className="border p-2 w-full mb-3"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push(`/entry/reading/${id}`)}
            className="border px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>

        {statusMessage && <p className="mt-4 text-sm">{statusMessage}</p>}
      </div>
    </div>
  );
}