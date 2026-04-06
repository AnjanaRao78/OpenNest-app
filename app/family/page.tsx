"use client";

import { useState } from "react";
import { createFamilyGroup, joinFamilyGroup } from "@/lib/family";

export default function FamilyPage() {
  const [familyName, setFamilyName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [result, setResult] = useState("");
  const dynamic = "force-dynamic";

  async function handleCreate() {
    try {
      const res = await createFamilyGroup(familyName, creatorName);
      setResult(`Family created. Invite code: ${res.inviteCode}`);
      setFamilyName("");
    } catch (error) {
      console.error(error);
      setResult("Failed to create family.");
    }
  }

  async function handleJoin() {
    try {
      await joinFamilyGroup(joinCode, joinName);
      setResult("Joined family group.");
      setJoinCode("");
      setJoinName("");
    } catch (error) {
      console.error(error);
      setResult("Failed to join family.");
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Family Group</h1>

      <div className="border p-4 rounded mb-6">
        <h2 className="font-semibold mb-3">Create Family</h2>
        <input
          className="border p-2 w-full mb-3"
          placeholder="Family name"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-3"
          placeholder="Your name"
          value={creatorName}
          onChange={(e) => setCreatorName(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Create Family
        </button>
      </div>

      <div className="border p-4 rounded">
        <h2 className="font-semibold mb-3">Join Family</h2>
        <input
          className="border p-2 w-full mb-3"
          placeholder="Invite code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-3"
          placeholder="Your name"
          value={joinName}
          onChange={(e) => setJoinName(e.target.value)}
        />
        <button
          onClick={handleJoin}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Join Family
        </button>
      </div>

      {result && <p className="mt-4">{result}</p>}
    </div>
  );
}