"use client";

import { useState } from "react";
import { saveHobbyEntry } from "@/lib/hobbies/hobbies";

export default function HobbiesPage() {
  const [hobbyName, setHobbyName] = useState("");
  const [frequencyGoal, setFrequencyGoal] = useState("weekly");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  async function handleSave() {
    try {
      await saveHobbyEntry({
        familyId: "demo-family-1",
        authorName: "Anju",
        hobbyName,
        frequencyGoal,
        notes,
        createdAt: Date.now(),
      });

      setMessage("Hobby entry saved.");
      setHobbyName("");
      setFrequencyGoal("weekly");
      setNotes("");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save hobby entry.");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Hobbies</h1>

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

      <button
        onClick={handleSave}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Save Hobby Entry
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}