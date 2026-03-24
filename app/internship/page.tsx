"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { saveInternshipEntry } from "@/lib/internship";
import PageHeader from "@/components/PageHeader";

export default function InternshipPage() {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState("");
  const [statusValue, setStatusValue] = useState("searching");
  const [milestone, setMilestone] = useState("");
  const [blocker, setBlocker] = useState("");
  const [message, setMessage] = useState("");
  const [startDate,setStartDate] = useState("");
  const [endDate,setEndDate] = useState("");
  
  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return () => unsub();
  }, []);

   async function handleSave() {
    try {
      if (!user) {
        setMessage("Please sign in first.");
        return;
      }
      await saveInternshipEntry({
        familyId: "demo-family-1",
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        company,
        status: statusValue,
        milestone,
        blocker,
        startDate,
        endDate,
        createdAt: Date.now(),
      });

      setMessage("Internship entry saved.");
      setCompany("");
      setStatusValue("searching");
      setMilestone("");
      setBlocker("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save internship entry.");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <PageHeader title="Internship" />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
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
        placeholder="Milestone"
        value={milestone}
        onChange={(e) => setMilestone(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Blocker"
        value={blocker}
        onChange={(e) => setBlocker(e.target.value)}
      />
      <input
      type="date"
      className="border p-2 w-full mb-3"
      value={startDate}
      onChange={(e)=>setStartDate(e.target.value)}
    />
    <input
        type="date"
        className="border p-2 w-full mb-3"
        value={endDate}
        onChange={(e)=>setEndDate(e.target.value)}
    />
    <button
            onClick={handleSave}
            className="bg-black text-white px-4 py-2 rounded"
          >
            Save Internship Entry
    </button>

      {message && <p className="mt-4">{message}</p>}
</div>
  );
}