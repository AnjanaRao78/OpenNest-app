"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { saveReadingEntry } from "@/lib/reading";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/types/firebase1";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";

export default function ReadingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"library" | "dashboard">("dashboard");

  const [title, setTitle] = useState("");
  const [statusValue, setStatusValue] = useState("to-read");
  const [notes, setNotes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (!authUser) return;

      const q = query(collection(db, "reading"), where("authorUid", "==", authUser.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => unsub();
  }, []);

  async function reloadEntries(uid: string) {
    const q = query(collection(db, "reading"), where("authorUid", "==", uid));
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
      await saveReadingEntry({
        familyId: "demo-family-1",
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        title,
        status: statusValue,
        notes,
        startDate,
        createdAt: Date.now(),
      });


      await reloadEntries(user.uid);

      setTitle("");
      setStatusValue("to-read");
      setNotes("");
      setStartDate("");
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
    <div>
      <PageHeader title="Reading" />

      <div className="module-page">
        <div className="module-summary-grid">
          <SummaryCard label="Currently Reading" value={activeReads.length} />
          <SummaryCard label="Reading Queue" value={queuedReads.length} />
          <SummaryCard label="Finished" value={finishedReads.length} />
          <SummaryCard label="Library Size" value={entries.length} />
        </div>

        <div className="module-tabs">
          <button
            className={`module-tab ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`module-tab ${activeTab === "library" ? "active" : ""}`}
            onClick={() => setActiveTab("library")}
          >
            Library
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <div className="module-grid-2">
            <DashboardCard title="Currently Reading">
              <div className="module-list">
                {activeReads.length > 0 ? (
                  activeReads.map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="module-item-title">{entry.title}</div>
                          <div className="module-item-subtitle">
                            Started: {entry.startDate || "-"}
                          </div>
                        </div>
                        <Link href={`/entry/reading/${entry.id}`} className="underline text-sm">
                          Open
                        </Link>
                      </div>
                      {entry.notes && <div className="module-meta"><p>{entry.notes}</p></div>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No active reads.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Reading Queue">
              <div className="module-list">
                {queuedReads.length > 0 ? (
                  queuedReads.map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="module-item-title">{entry.title}</div>
                      <div className="module-item-subtitle">Queued</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No queued reads.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Finished Recently">
              <div className="module-list">
                {finishedReads.length > 0 ? (
                  finishedReads.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="module-item-title">{entry.title}</div>
                      <div className="module-item-subtitle">Finished</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Nothing finished yet.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Add to Reading List">
              <div className="module-form">
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

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <textarea
                  placeholder="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <button onClick={handleSave} className="module-button-primary">
                  Save Reading Entry
                </button>

                {message && <p className="mt-3 text-sm">{message}</p>}
              </div>
            </DashboardCard>
          </div>
        ) : (
          <div className="module-card">
            <h2 className="module-section-title">Reading Library</h2>
            <div className="module-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div key={entry.id} className="module-item">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="module-item-title">{entry.title}</div>
                        <div className="module-item-subtitle">
                          {entry.status} {entry.startDate ? `· ${entry.startDate}` : ""}
                        </div>
                      </div>
                      <Link href={`/entry/reading/${entry.id}`} className="underline text-sm">
                        Open
                      </Link>
                    </div>
                    {entry.notes && <div className="module-meta"><p>{entry.notes}</p></div>}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No reading entries yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}