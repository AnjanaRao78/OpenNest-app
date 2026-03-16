"use client";

import { useState } from "react";
import { saveReflection } from "@/lib/reflections";

export default function ReflectionPage() {
  const [mood, setMood] = useState("");
  const [highlight, setHighlight] = useState("");
  const [challenge, setChallenge] = useState("");
  const [needType, setNeedType] = useState("listening");
  const [visibility, setVisibility] = useState("everyone");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    try {
      await saveReflection({
        familyId: "demo-family-1",
        authorName: "Anju",
        authorRole: "parent",
        mood,
        highlight,
        challenge,
        needType,
        visibility: visibility as any,
        createdAt: Date.now(),
      });

      setMessage("Reflection saved.");
      setMood("");
      setHighlight("");
      setChallenge("");
      setNeedType("listening");
      setVisibility("everyone");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save reflection.");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Today's Reflection</h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Mood"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Highlight"
        value={highlight}
        onChange={(e) => setHighlight(e.target.value)}
      />

      <textarea
        className="border p-2 w-full mb-3"
        placeholder="Challenge"
        value={challenge}
        onChange={(e) => setChallenge(e.target.value)}
      />

      <select
        className="border p-2 w-full mb-3"
        value={needType}
        onChange={(e) => setNeedType(e.target.value)}
      >
        <option value="listening">Listening</option>
        <option value="advice">Advice</option>
        <option value="space">Space</option>
        <option value="celebrate">Celebrate</option>
        <option value="practical">Practical Help</option>
      </select>

      <select
        className="border p-2 w-full mb-3"
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
      >
        <option value="everyone">Everyone</option>
        <option value="parentsOnly">Parents only</option>
        <option value="siblingOnly">Sibling only</option>
        <option value="onlyMe">Only me</option>
      </select>

      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Post Reflection
      </button>

      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}