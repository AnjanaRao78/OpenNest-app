
"use client";

import { useState } from "react";
import { saveStudiesEntry } from "@/lib/studies";

export default function StudiesPage() {
  const [term, setTerm] = useState("");
  const [courseName, setCourseName] = useState("");
  const [workload, setWorkload] = useState("medium");
  const [weeklyFocus, setWeeklyFocus] = useState("");
  const [status, setStatus] = useState("");
  const [startDate,setStartDate] = useState("");
  const [endDate,setEndDate] = useState("");

  async function handleSave() {
    try {
      await saveStudiesEntry({
        familyId: "demo-family-1",
        authorName: "Anju",
        term,
        courseName,
        workload,
        weeklyFocus,
        startDate,
        endDate,
        createdAt: Date.now(),
      });

      setStatus("Studies entry saved.");
      setTerm("");
      setCourseName("");
      setWorkload("medium");
      setWeeklyFocus("");

    } catch (error) {
      console.error(error);
      setStatus("Failed to save studies entry.");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Studies</h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Term (e.g. Spring 2026)"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Course name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
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
        placeholder="Weekly focus"
        value={weeklyFocus}
        onChange={(e) => setWeeklyFocus(e.target.value)}
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
        Save Studies Update
</button>

      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}