"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/types/firebase1";
import { subscribeToAuth } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

export default function EditInternshipPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const [company, setCompany] = useState("");
  const [statusValue, setStatusValue] = useState("searching");
  const [milestone, setMilestone] = useState("");
  const [blocker, setBlocker] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function loadEntry() {
      try {
        const ref = doc(db, "internship", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setStatusMessage("Internship entry not found.");
          setLoading(false);
          return;
        }

        const data = snap.data();

        setCompany(data.company || "");
        setStatusValue(data.status || "searching");
        setMilestone(data.milestone || "");
        setBlocker(data.blocker || "");
        setStartDate(data.startDate || "");
        setEndDate(data.endDate || "");
        setLoading(false);
      } catch (error) {
        console.error(error);
        setStatusMessage("Failed to load internship entry.");
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
      const ref = doc(db, "internship", id);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        setStatusMessage("Internship entry not found.");
        return;
      }

      const data = snap.data();

      if (data.authorUid !== user.uid) {
        setStatusMessage("You can only edit your own internship entry.");
        return;
      }

      await updateDoc(ref, {
        company,
        status: statusValue,
        milestone,
        blocker,
        startDate,
        endDate,
      });

      router.push(`/entry/internship/${id}`);
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to save changes.");
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="rounded-2xl border bg-white shadow p-6">
        <PageHeader title="Edit Internship" />

        <input
          className="border p-2 w-full mb-3"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Company"
        />

        <select
          className="border p-2 w-full mb-3"
          value={statusValue}
          onChange={(e) => setStatusValue(e.target.value)}
        >
          <option value="searching">Searching</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="active">Active</option>
        </select>

        <textarea
          className="border p-2 w-full mb-3"
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
          placeholder="Milestone"
        />

        <textarea
          className="border p-2 w-full mb-3"
          value={blocker}
          onChange={(e) => setBlocker(e.target.value)}
          placeholder="Blocker"
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

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>

          <button
            onClick={() => router.push(`/entry/internship/${id}`)}
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