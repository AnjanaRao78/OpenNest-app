"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  createFamily,
  saveUserProfile,
  subscribeToAuth,
} from "@/lib/auth";

type RelationshipType = "parent" | "sibling" | "child";

export default function OnboardingPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [families, setFamilies] = useState<any[]>([]);
  const [mode, setMode] = useState<"join" | "create">("join");

  const [familyId, setFamilyId] = useState("");
  const [newFamilyName, setNewFamilyName] = useState("");
  const [relationship, setRelationship] = useState<RelationshipType>("child");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(setUser);

    async function loadFamilies() {
      try {
        const snap = await getDocs(collection(db, "families"));
        const familyList = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFamilies(familyList);
      } catch (error) {
        console.error(error);
        setStatus("Failed to load families.");
      }
    }

    loadFamilies();

    return () => unsub();
  }, []);

  async function handleContinue() {
    if (!user) {
      setStatus("Please sign in first.");
      return;
    }

    let selectedFamilyId = familyId;

    try {
      if (mode === "create") {
        if (!newFamilyName.trim()) {
          setStatus("Please enter a family name.");
          return;
        }

        const newFamily = await createFamily(newFamilyName.trim());
        selectedFamilyId = newFamily.id;
      } else {
        if (!familyId) {
          setStatus("Please choose an existing family.");
          return;
        }
      }

      await saveUserProfile({
        uid: user.uid,
        displayName: user.displayName || "Unknown",
        email: user.email || "",
        photoURL: user.photoURL || "",
        familyId: selectedFamilyId,
        relationship,
      });

      router.push("/");
    } catch (error) {
      console.error(error);
      setStatus("Failed to save your profile.");
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-xl mx-auto border rounded-2xl p-6 shadow">
        <h1 className="text-2xl font-bold mb-4">Set up your family login</h1>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMode("join")}
            className={`px-4 py-2 rounded border ${
              mode === "join" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Join Existing Family
          </button>

          <button
            onClick={() => setMode("create")}
            className={`px-4 py-2 rounded border ${
              mode === "create" ? "bg-black text-white" : "bg-white"
            }`}
          >
            Create Family
          </button>
        </div>

        {mode === "join" ? (
          <>
            <label className="block mb-2 font-medium">Choose Family</label>
            <select
              className="border p-2 w-full mb-4"
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
            >
              <option value="">Select family</option>
              {families.map((family) => (
                <option key={family.id} value={family.id}>
                  {family.name}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <label className="block mb-2 font-medium">New Family Name</label>
            <input
              className="border p-2 w-full mb-4"
              placeholder="Enter family name"
              value={newFamilyName}
              onChange={(e) => setNewFamilyName(e.target.value)}
            />
          </>
        )}

        <label className="block mb-2 font-medium">Family Member Type</label>
        <select
          className="border p-2 w-full mb-4"
          value={relationship}
          onChange={(e) =>
            setRelationship(e.target.value as RelationshipType)
          }
        >
          <option value="parent">Parent</option>
          <option value="sibling">Sibling</option>
          <option value="child">Child</option>
        </select>

        <button
          onClick={handleContinue}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Continue
        </button>

        {status && <p className="mt-4 text-sm">{status}</p>}
      </div>
    </div>
  );
}