"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadReadingByAuthor, saveReadingEntry } from "@/lib/reading";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";


export default function ReadingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "library">(
    "dashboard"
  );

  const [title, setTitle] = useState("");
  const [statusValue, setStatusValue] = useState("to-read");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (!authUser) return;
      const userProfile: any = await getUserProfile(authUser.uid);
      setProfile(userProfile);
      const data = await loadReadingByAuthor(authUser.uid, profile.familyId);
      setEntries(data);
    });

    return () => unsub();
  }, []);

  async function reloadEntries(uid: string) {
    const data = await loadReadingByAuthor(uid, profile.familyId);
    setEntries(data);
  }

  async function handleSave() {
    if (!user) {
      setMessage("Please sign in first.");
      return;
    }

    if (!title.trim()) {
      setMessage("Please enter a title.");
      return;
    }

    if (!startDate) {
      setMessage("Please choose a start date.");
      return;
    }

    try {
      await saveReadingEntry({
        familyId: profile.familyId,
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        title,
        status: statusValue,
        notes,
        startDate,
        endDate,
        createdAt: Date.now(),
      });

      await reloadEntries(user.uid);

      setTitle("");
      setStatusValue("to-read");
      setNotes("");
      setStartDate("");
      setEndDate("");
      setMessage("Reading entry saved.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save reading entry.");
    }
  }

  const activeReads = useMemo(
    () => entries.filter((e) => e.status === "reading"),
    [entries]
  );
  const queuedReads = useMemo(
    () => entries.filter((e) => e.status === "to-read"),
    [entries]
  );
  const finishedReads = useMemo(
    () => entries.filter((e) => e.status === "finished"),
    [entries]
  );

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Reading" />

        <div className="opennest-hero-card">
          <div className="opennest-card-title">Your reading corner</div>
          <div className="opennest-card-subtitle">
            Track what you want to read, what you are reading, and what you have
            finished — all in one calm little nook.
          </div>
        </div>

        <div className="opennest-summary-grid">
          <SummaryCard label="Currently Reading" value={activeReads.length} />
          <SummaryCard label="Reading Queue" value={queuedReads.length} />
          <SummaryCard label="Finished" value={finishedReads.length} />
          <SummaryCard label="Library Size" value={entries.length} />
        </div>

        <div className="opennest-tabs">
          <button
            type="button"
            className={`opennest-tab ${
              activeTab === "dashboard" ? "active" : ""
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`opennest-tab ${
              activeTab === "library" ? "active" : ""
            }`}
            onClick={() => setActiveTab("library")}
          >
            Library
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <div className="opennest-module-grid">
            <div className="opennest-section">
              <DashboardCard
                title="Currently Reading"
                accentClass="opennest-module-accent-reading"
              >
                <div className="opennest-list">
                  {activeReads.length > 0 ? (
                    activeReads.map((entry) => (
                      <div key={entry.id} className="opennest-list-card gold">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="opennest-list-title">
                              {entry.title}
                            </div>
                            <div className="opennest-list-meta">
                              Started: {entry.startDate || "-"}
                              {entry.endDate ? ` · Ends: ${entry.endDate}` : ""}
                            </div>
                          </div>

                          <Link
                            href={`/entry/reading/${entry.id}`}
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
                      No active reads yet.
                    </div>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard title="Reading Queue">
                <div className="opennest-list">
                  {queuedReads.length > 0 ? (
                    queuedReads.map((entry) => (
                      <div key={entry.id} className="opennest-list-card">
                        <div className="opennest-list-title">{entry.title}</div>
                        <div className="opennest-list-meta">
                          To Read · {entry.startDate || "-"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="opennest-empty-state">
                      No queued reads.
                    </div>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard title="Finished Recently">
                <div className="opennest-list">
                  {finishedReads.length > 0 ? (
                    finishedReads.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="opennest-list-card">
                        <div className="opennest-list-title">{entry.title}</div>
                        <div className="opennest-list-meta">
                          {entry.startDate || "-"}
                          {entry.endDate ? ` → ${entry.endDate}` : ""}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="opennest-empty-state">
                      Nothing finished yet.
                    </div>
                  )}
                </div>
              </DashboardCard>
            </div>

            <div className="opennest-section">
              <DashboardCard
                title="Add to Reading List"
                accentClass="opennest-module-accent-reading"
              >
                <div className="opennest-form">
                  <input
                    placeholder="Book or article title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />

                  <select
                    value={statusValue}
                    onChange={(e) => setStatusValue(e.target.value)}
                  >
                    <option value="to-read">To Read</option>
                    <option value="reading">Reading</option>
                    <option value="finished">Finished</option>
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
                    Save Reading Entry
                  </button>

                  {message && <div className="opennest-list-meta">{message}</div>}
                </div>
              </DashboardCard>
            </div>
          </div>
        ) : (
          <DashboardCard
            title="Reading Library"
            accentClass="opennest-module-accent-reading"
          >
            <div className="opennest-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div key={entry.id} className="opennest-list-card gold">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="opennest-list-title">{entry.title}</div>
                        <div className="opennest-list-meta">
                          {entry.status} · {entry.startDate || "-"}
                          {entry.endDate ? ` → ${entry.endDate}` : ""}
                        </div>
                      </div>

                      <Link
                        href={`/entry/reading/${entry.id}`}
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
                  No reading entries yet.
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