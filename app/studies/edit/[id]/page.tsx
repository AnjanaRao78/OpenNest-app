"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/types/firebase1";
import { subscribeToAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

export default function EditStudyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const [term, setTerm] = useState("");
  const [courseName, setCourseName] = useState("");
  const [workload, setWorkload] = useState("medium");
  const [weeklyFocus, setWeeklyFocus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function loadEntry() {
      const ref = doc(db, "studies", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setStatus("Entry not found.");
        setLoading(false);
        return;
      }

      const data = snap.data();

      setTerm(data.term || "");
      setCourseName(data.courseName || "");
      setWorkload(data.workload || "medium");
      setWeeklyFocus(data.weeklyFocus || "");
      setStartDate(data.startDate || "");
      setEndDate(data.endDate || "");
      setLoading(false);
    }

    loadEntry();
    return () => unsub();
  }, [id]);

  async function handleSave() {
    if (!user) {
      setStatus("Please sign in first.");
      return;
    }

    const ref = doc(db, "studies", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setStatus("Entry not found.");
      return;
    }

    const data = snap.data();

    if (data.authorUid !== user.uid) {
      setStatus("You can only edit your own entry.");
      return;
    }

    try {
      await updateDoc(ref, {
        term,
        courseName,
        workload,
        weeklyFocus,
        startDate,
        endDate,
      });

      router.push(`/entry/studies/${id}`);
    } catch (error) {
      console.error(error);
      setStatus("Failed to save changes.");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border bg-white shadow p-6">
        <PageHeader title="Edit Study Entry" />

        <input
          className="border p-2 w-full mb-3"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Term"
        />

        <input
          className="border p-2 w-full mb-3"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          placeholder="Course Name"
        />

        <select
          className="border p-2 w-full mb-3"
          value={workload}
          onChange={(e) => setWorkload(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <textarea
          className="border p-2 w-full mb-3"
          value={weeklyFocus}
          onChange={(e) => setWeeklyFocus(e.target.value)}
          placeholder="Weekly Focus"
        />

        <input
          type="date"
          className="border p-2 w-full mb-3"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 w-full mb-3"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>

        {status && <p className="mt-4">{status}</p>}
      </div>
    </div>
  );
}