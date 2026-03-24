"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { saveReadingEntry } from "@/lib/reading";
import PageNav from "@/components/PageNav";
import PageHeader from "@/components/PageHeader";

export default function ReadingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [statusValue, setStatusValue] = useState("to-read");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

   
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
      await saveReadingEntry({
        familyId: "demo-family-1",
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        title,
        status: statusValue,
        notes,
        createdAt: Date.now(),
      });

      setMessage("Reading entry saved.");
      setTitle("");
      setStatusValue("to-read");
      setNotes("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save reading entry.");
    }
  }
  
  return (
    <div className="p-6 max-w-xl mx-auto">
      <PageHeader title="Reading" />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Book or article title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Save Reading Entry
      </button>

      {message && <p className="mt-4">{message}</p>}
     
    </div>
    
  );

}