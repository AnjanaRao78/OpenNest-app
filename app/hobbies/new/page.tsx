"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { saveHobbyEntry } from "@/lib/hobbies";

type UserProfile = {
  uid: string;
  familyId: string;
  familyName?: string;
  relationship: "parent" | "sibling" | "child";
};

type HobbyStatus = "planned" | "started" | "in-progress" | "completed";

export default function NewHobbyPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [frequency, setFrequency] = useState("");
  const [status, setStatus] = useState<HobbyStatus>("planned");
  const [startDate, setStartDate] = useState("");
  const [targetEndDate, setTargetEndDate] = useState("");
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userProfile = (await getUserProfile(authUser.uid)) as UserProfile | null;
        setProfile(userProfile);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  async function handleSave() {
    if (!user) {
      setMessage("Please sign in first.");
      return;
    }

    if (!profile?.familyId) {
      setMessage("Please complete family setup first.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter a hobby title.");
      return;
    }

    if (!startDate) {
      setMessage("Please choose a start date.");
      return;
    }

    if (targetEndDate && targetEndDate < startDate) {
      setMessage("Target end date cannot be earlier than start date.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await saveHobbyEntry({
        familyId: profile.familyId,
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        title: title.trim(),
        hobbyName: title.trim(),
        category: category.trim(),
        skillLevel: skillLevel.trim(),
        frequency: frequency.trim(),
        notes: notes.trim(),
        status,
        startDate,
        targetEndDate,
        progress,
        createdAt: Date.now(),
      });

      router.replace("/hobbies/calendar");
    } catch (error) {
      console.error("Failed to save hobby:", error);
      setMessage("Failed to save hobby.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="New Hobby" />
          <div className="opennest-card">
            <div className="opennest-card-subtitle">Loading...</div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="New Hobby" />
          <div className="opennest-card">
            <div className="opennest-card-subtitle">
              Please sign in to create a hobby.
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!profile?.familyId) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="New Hobby" />
          <div className="opennest-card">
            <div className="opennest-card-subtitle">
              Complete family setup before creating hobbies.
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="New Hobby" />

        <div className="opennest-hero-card" style={{ marginBottom: 18 }}>
          <div className="opennest-card-title">Add a hobby</div>
          <div className="opennest-card-subtitle">
            Capture an interest, routine, or creative pursuit and place it on the family calendar.
          </div>
        </div>

        <div className="opennest-card">
          <div className="opennest-form">
            <input
              placeholder="Hobby title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <input
              placeholder="Skill level"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            />

            <input
              placeholder="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as HobbyStatus)}
            >
              <option value="planned">Planned</option>
              <option value="started">Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <div className="opennest-form-row-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />

              <input
                type="date"
                value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
              />
            </div>

            <div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--on-text-soft)",
                  marginBottom: 8,
                }}
              >
                Progress: {progress}%
              </div>

              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            <textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                borderRadius: 16,
                padding: 14,
                border: "1px solid rgba(0,0,0,0.08)",
                resize: "vertical",
              }}
            />

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="opennest-button opennest-button-primary"
            >
              {saving ? "Saving..." : "Save Hobby"}
            </button>

            {message && <div className="opennest-list-meta">{message}</div>}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}