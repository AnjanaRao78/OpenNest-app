"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { saveHobbyEntry } from "@/lib/hobbies";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/types/firebase1";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";

export default function HobbiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "board">("dashboard");

  const [hobbyName, setHobbyName] = useState("");
  const [frequencyGoal, setFrequencyGoal] = useState("weekly");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (!authUser) return;

      const q = query(collection(db, "hobbies"), where("authorUid", "==", authUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => unsub();
  }, []);

  async function reloadEntries(uid: string) {
    const q = query(collection(db, "hobbies"), where("authorUid", "==", uid));
    const snap = await getDocs(q);
    const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setEntries(data);
  }

  async function handleSave() {
    if (!user) {
      setMessage("Please sign in first.");
      return;
    }

    try {
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

      await reloadEntries(user.uid);

      setHobbyName("");
      setFrequencyGoal("weekly");
      setNotes("");
      setStartDate("");
      setEndDate("");
      setMessage("Hobby entry saved.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save hobby entry.");
    }
  }

  const activeHobbies = useMemo(
    () => entries.filter((e) => !e.endDate),
    [entries]
  );
  const completedHobbies = useMemo(
    () => entries.filter((e) => !!e.endDate),
    [entries]
  );

  const weeklyGoals = useMemo(
    () => entries.filter((e) => e.frequencyGoal === "weekly").length,
    [entries]
  );

  return (
    <div>
      <PageHeader title="Hobbies" />

      <div className="module-page">
        <div className="module-summary-grid">
          <SummaryCard label="Active Hobbies" value={activeHobbies.length} />
          <SummaryCard label="Completed" value={completedHobbies.length} />
          <SummaryCard label="Weekly Goals" value={weeklyGoals} />
          <SummaryCard label="Hobby Board" value={entries.length} />
        </div>

        <div className="module-tabs">
          <button
            className={`module-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`module-tab ${activeTab === "board" ? "active" : ""}`}
            onClick={() => setActiveTab("board")}
          >
            Hobby Board
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <div className="module-grid-2">
            <DashboardCard title="Active Hobbies">
              <div className="module-list">
                {activeHobbies.length > 0 ? (
                  activeHobbies.map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="module-item-title">{entry.hobbyName}</div>
                          <div className="module-item-subtitle">
                            {entry.frequencyGoal} · started {entry.startDate || "-"}
                          </div>
                        </div>
                        <Link href={`/entry/hobbies/${entry.id}`} className="underline text-sm">
                          Open
                        </Link>
                      </div>

                      {entry.notes && (
                        <div className="module-meta">
                          <p>{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No active hobbies yet.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Add Hobby">
              <div className="module-form">
                <input
                  placeholder="Hobby name"
                  value={hobbyName}
                  onChange={(e) => setHobbyName(e.target.value)}
                />

                <select
                  value={frequencyGoal}
                  onChange={(e) => setFrequencyGoal(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                <textarea
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <button onClick={handleSave} className="module-button-primary">
                  Save Hobby
                </button>

                {message && <p className="mt-3 text-sm">{message}</p>}
              </div>
            </DashboardCard>

            <DashboardCard title="Hobby Timeline">
              <div className="module-list">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="module-item-title">{entry.hobbyName}</div>
                      <div className="module-item-subtitle">
                        {entry.startDate || "-"} → {entry.endDate || "Ongoing"}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No hobby timeline yet.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Goal Types">
              <div className="module-badge-row">
                {entries.map((entry) => (
                  <span key={entry.id} className="module-badge">
                    {entry.hobbyName} · {entry.frequencyGoal}
                  </span>
                ))}
                {entries.length === 0 && (
                  <p className="text-sm text-gray-500">No goal tags yet.</p>
                )}
              </div>
            </DashboardCard>
          </div>
        ) : (
          <div className="module-card">
            <h2 className="module-section-title">Hobby Board</h2>
            <div className="module-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div key={entry.id} className="module-item">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="module-item-title">{entry.hobbyName}</div>
                        <div className="module-item-subtitle">
                          {entry.frequencyGoal} · {entry.startDate || "-"} → {entry.endDate || "Ongoing"}
                        </div>
                      </div>
                      <Link href={`/entry/hobbies/${entry.id}`} className="underline text-sm">
                        Open
                      </Link>
                    </div>

                    {entry.notes && (
                      <div className="module-meta">
                        <p>{entry.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hobbies added yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}