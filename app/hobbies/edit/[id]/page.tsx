"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { saveHobbyEntry } from "@/lib/hobbies";
import PageHeader from "@/components/PageHeader";

export default function EditHobbiesPage() {

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [hobbyName, setHobbyName] = useState("");
  const [frequencyGoal, setFrequencyGoal] = useState("weekly");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [startDate,setStartDate] = useState("");
  const [endDate,setEndDate] = useState("");
  
  
  useEffect(() => {
    const unsub = subscribeToAuth(setUser);
    return () => unsub();
  }, []);

  
  async function handleSave() {
    try {
      if (!user) {
        setStatus("Please sign in first.");
        return;
      }
      await saveHobbyEntry({
        familyId: "demo-family-1",
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        hobbyName,
        frequencyGoal,
        notes,
        startDate,
        endDate,
        createdAt: Date.now(),
      });

      setStatus("Hobby entry saved.");
      setHobbyName("");
      setFrequencyGoal("weekly");
      setNotes("");
    } catch (error) {
      console.error(error);
      setStatus("Failed to save hobby entry.");
    }
  }

  return (
<div className="p-6 max-w-xl mx-auto">
   <PageHeader title="Hobbies" />
    <div className="p-6 max-w-xl mx-auto">
      <input
        className="border p-2 w-full mb-3"
        placeholder="Hobby name"
        value={hobbyName}
        onChange={(e) => setHobbyName(e.target.value)}
      />
      <select
        className="border p-2 w-full mb-3"
        value={frequencyGoal}
        onChange={(e) => setFrequencyGoal(e.target.value)}
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
      </select>

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
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
        Save Hobby Entry
      </button>

      {status && <p className="mt-4">{status}</p>}
    </div>
  </div>
  );
}