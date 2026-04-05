"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadHobbiesByAuthor, saveHobbyEntry } from "@/lib/hobbies";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";

export default function HobbiesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
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

      const userProfile = await getUserProfile(authUser.uid);
      setProfile(userProfile);

      const hobbyData = await loadHobbiesByAuthor(authUser.uid, profile.familyId);
      setEntries(hobbyData);
    });

    return () => unsub();
  }, []);

  async function reloadEntries(uid: string) {
    const hobbyData = await loadHobbiesByAuthor(uid, profile.familyId);
    setEntries(hobbyData);
  }

  async function handleSave() {
    if (!user || !profile) {
      setMessage("Please complete login setup first.");
      return;
    }

    if (!hobbyName.trim() || !startDate) {
      setMessage("Please enter a hobby name and start date.");
      return;
    }

    try {
      await saveHobbyEntry({
        familyId: profile.familyId,
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
      setMessage("Hobby saved.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save hobby.");
    }
  }

  const activeHobbies = useMemo(
    () => entries.filter((entry) => !entry.endDate),
    [entries]
  );

  const completedHobbies = useMemo(
    () => entries.filter((entry) => !!entry.endDate),
    [entries]
  );

  const weeklyGoals = useMemo(
    () => entries.filter((entry) => entry.frequencyGoal === "weekly").length,
    [entries]
  );

  const dailyGoals = useMemo(
    () => entries.filter((entry) => entry.frequencyGoal === "daily").length,
    [entries]
  );

  const monthlyGoals = useMemo(
    () => entries.filter((entry) => entry.frequencyGoal === "monthly").length,
    [entries]
  );

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Hobbies" />

        <div className="opennest-hero-card">
          <div className="opennest-card-title">Your creative life board</div>
          <div className="opennest-card-subtitle">
            Keep track of the things that keep you curious, playful, and growing —
            from daily habits to long-running passions.
          </div>
        </div>

        <div className="opennest-summary-grid">
          <SummaryCard label="Active Hobbies" value={activeHobbies.length} />
          <SummaryCard label="Completed" value={completedHobbies.length} />
          <SummaryCard label="Weekly Goals" value={weeklyGoals} />
          <SummaryCard label="Hobby Board" value={entries.length} />
        </div>

        <div className="opennest-tabs">
          <button
            type="button"
            className={`opennest-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`opennest-tab ${activeTab === "board" ? "active" : ""}`}
            onClick={() => setActiveTab("board")}
          >
            Hobby Board
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="opennest-module-grid">
            <div className="opennest-section">
              <DashboardCard
                title="Active Hobbies"
                accentClass="opennest-module-accent-hobbies"
              >
                <div className="opennest-list">
                  {activeHobbies.length > 0 ? (
                    activeHobbies.map((entry) => (
                      <div key={entry.id} className="opennest-list-card">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="opennest-list-title">
                              {entry.hobbyName}
                            </div>
                            <div className="opennest-list-meta">
                              {entry.frequencyGoal} · started {entry.startDate || "-"}
                            </div>
                          </div>

                          <Link
                            href={`/entry/hobbies/${entry.id}`}
                            className="underline text-sm"
                          >
                            Open
                          </Link>
                        </div>

                        {entry.notes && (
                          <div className="opennest-meta-grid">
                            <div>{entry.notes}</div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="opennest-empty-state">
                      No active hobbies yet.
                    </div>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard title="Goal Types">
                {entries.length > 0 ? (
                  <div className="opennest-pill-row">
                    {entries.map((entry) => (
                      <span key={entry.id} className="opennest-pill">
                        {entry.hobbyName} · {entry.frequencyGoal}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="opennest-empty-state">No goal tags yet.</div>
                )}
              </DashboardCard>

              <DashboardCard title="Goal Mix">
                <div className="opennest-meta-grid">
                  <div>
                    <strong>Daily:</strong> {dailyGoals}
                  </div>
                  <div>
                    <strong>Weekly:</strong> {weeklyGoals}
                  </div>
                  <div>
                    <strong>Monthly:</strong> {monthlyGoals}
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Hobby Timeline">
                <div className="opennest-list">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <div key={entry.id} className="opennest-list-card">
                        <div className="opennest-list-title">
                          {entry.hobbyName}
                        </div>
                        <div className="opennest-list-meta">
                          {entry.startDate || "-"} → {entry.endDate || "Ongoing"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="opennest-empty-state">
                      No hobby timeline yet.
                    </div>
                  )}
                </div>
              </DashboardCard>
            </div>

            <div className="opennest-section">
              <DashboardCard
                title="Add Hobby"
                accentClass="opennest-module-accent-hobbies"
              >
                <div className="opennest-form">
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

                  <div className="opennest-form-row-2">
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
                  </div>

                  <textarea
                    placeholder="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={handleSave}
                    className="opennest-button opennest-button-primary"
                  >
                    Save Hobby
                  </button>

                  {message && <div className="opennest-list-meta">{message}</div>}
                </div>
              </DashboardCard>
            </div>
          </div>
        )}

        {activeTab === "board" && (
          <DashboardCard
            title="Hobby Board"
            accentClass="opennest-module-accent-hobbies"
          >
            <div className="opennest-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div key={entry.id} className="opennest-list-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="opennest-list-title">
                          {entry.hobbyName}
                        </div>
                        <div className="opennest-list-meta">
                          {entry.frequencyGoal} · {entry.startDate || "-"} →{" "}
                          {entry.endDate || "Ongoing"}
                        </div>
                      </div>

                      <Link
                        href={`/entry/hobbies/${entry.id}`}
                        className="underline text-sm"
                      >
                        Open
                      </Link>
                    </div>

                    {entry.notes && (
                      <div className="opennest-meta-grid">
                        <div>{entry.notes}</div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="opennest-empty-state">
                  No hobbies added yet.
                </div>
              )}
            </div>
          </DashboardCard>
        )}
      </div>

      <BottomNav />
    </div>
  );
}