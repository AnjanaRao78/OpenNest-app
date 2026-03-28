"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth } from "@/lib/auth";
import { saveInternshipEntry, loadInternshipsByAuthor } from "@/lib/internship";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import Link from "next/link";

export default function InternshipPage() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "board">("dashboard");

  const [company, setCompany] = useState("");
  const [statusValue, setStatusValue] = useState("searching");
  const [milestone, setMilestone] = useState("");
  const [blocker, setBlocker] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);
      if (!authUser) return;

      const data = await loadInternshipsByAuthor(authUser.uid);
      setEntries(data);
    });

    return () => unsub();
  }, []);

  async function reloadEntries(uid: string) {
    const data = await loadInternshipsByAuthor(uid);
    setEntries(data);
  }

  async function handleSave() {
    if (!user) {
      setMessage("Please sign in first.");
      return;
    }

    try {
      await saveInternshipEntry({
        familyId: "demo-family-1",
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        company,
        status: statusValue,
        milestone,
        blocker,
        startDate,
        endDate,
        createdAt: Date.now(),
      });

      await reloadEntries(user.uid);

      setCompany("");
      setStatusValue("searching");
      setMilestone("");
      setBlocker("");
      setStartDate("");
      setEndDate("");
      setMessage("Internship entry saved.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save internship entry.");
    }
  }

  const activeInternships = useMemo(
    () => entries.filter((e) => e.status === "active"),
    [entries]
  );

  const interviewingEntries = useMemo(
    () => entries.filter((e) => e.status === "interviewing"),
    [entries]
  );

  const offeredEntries = useMemo(
    () => entries.filter((e) => e.status === "offered"),
    [entries]
  );

  const searchingEntries = useMemo(
    () => entries.filter((e) => e.status === "searching"),
    [entries]
  );

  const uniqueCompanies = useMemo(
    () => Array.from(new Set(entries.map((e) => e.company).filter(Boolean))),
    [entries]
  );

  return (
    <div>
      <PageHeader title="Internship" />

      <div className="module-page">
        <div className="module-summary-grid">
          <SummaryCard label="Active" value={activeInternships.length} />
          <SummaryCard label="Interviewing" value={interviewingEntries.length} />
          <SummaryCard label="Offers / Active" value={offeredEntries.length + activeInternships.length} />
          <SummaryCard label="Companies Tracked" value={uniqueCompanies.length} />
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
            Internship Board
          </button>
        </div>

        {activeTab === "dashboard" ? (
          <div className="module-grid-2">
            <DashboardCard title="Current / Active Internships">
              <div className="module-list">
                {activeInternships.length > 0 ? (
                  activeInternships.map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="module-item-title">{entry.company}</div>
                          <div className="module-item-subtitle">
                            {entry.startDate || "-"} → {entry.endDate || "Ongoing"}
                          </div>
                        </div>
                        <Link
                          href={`/entry/internship/${entry.id}`}
                          className="underline text-sm"
                        >
                          Open
                        </Link>
                      </div>

                      <div className="module-meta">
                        <p><strong>Status:</strong> {entry.status}</p>
                        <p><strong>Milestone:</strong> {entry.milestone || "-"}</p>
                        <p><strong>Blocker:</strong> {entry.blocker || "-"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No active internships yet.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Internship Pipeline">
              <div className="module-list">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="module-item-title">{entry.company}</div>
                      <div className="module-item-subtitle">
                        {entry.status} · {entry.startDate || "-"} → {entry.endDate || "-"}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No pipeline entries yet.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Milestones & Blockers">
              <div className="module-list">
                {entries.length > 0 ? (
                  entries.map((entry) => (
                    <div key={entry.id} className="module-item">
                      <div className="module-item-title">{entry.company}</div>
                      <div className="module-meta">
                        <p><strong>Milestone:</strong> {entry.milestone || "-"}</p>
                        <p><strong>Blocker:</strong> {entry.blocker || "-"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No milestone data yet.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard title="Add Internship Entry">
              <div className="module-form">
                <input
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />

                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                >
                  <option value="searching">Searching</option>
                  <option value="interviewing">Interviewing</option>
                  <option value="offered">Offered</option>
                  <option value="active">Active</option>
                </select>

                <textarea
                  placeholder="Milestone"
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                />

                <textarea
                  placeholder="Blocker"
                  value={blocker}
                  onChange={(e) => setBlocker(e.target.value)}
                />

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

                <button onClick={handleSave} className="module-button-primary">
                  Save Internship
                </button>

                {message && <p className="mt-3 text-sm">{message}</p>}
              </div>
            </DashboardCard>
          </div>
        ) : (
          <div className="module-card">
            <h2 className="module-section-title">Internship Board</h2>

            <div className="module-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div key={entry.id} className="module-item">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="module-item-title">{entry.company}</div>
                        <div className="module-item-subtitle">
                          {entry.status} · {entry.startDate || "-"} → {entry.endDate || "Ongoing"}
                        </div>
                      </div>

                      <Link
                        href={`/entry/internship/${entry.id}`}
                        className="underline text-sm"
                      >
                        Open
                      </Link>
                    </div>

                    <div className="module-meta">
                      <p><strong>Milestone:</strong> {entry.milestone || "-"}</p>
                      <p><strong>Blocker:</strong> {entry.blocker || "-"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No internship entries yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}