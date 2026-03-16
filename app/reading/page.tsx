"use client";

import { useState } from "react";
import { saveReadingEntry } from "@/lib/reading";

export default function ReadingPage() {
  const [title, setTitle] = useState("");
  const [statusValue, setStatusValue] = useState("to-read");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");


  async function handleSave() {
    try {
      await saveReadingEntry({
        familyId: "demo-family-1",
        authorName: "Anju",
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
      <h1 className="text-2xl font-bold mb-4">Reading</h1>

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