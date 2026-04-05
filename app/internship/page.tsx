"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import {
  loadInternshipsByAuthor,
  saveInternshipEntry,
} from "@/lib/internship";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";

export default function InternshipPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "board">(
    "dashboard"
  );

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

      const userProfile = await getUserProfile(authUser.uid);
      setProfile(userProfile);

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
    if (!user || !profile) {
      setMessage("Please complete login setup first.");
      return;
    }

    if (!company.trim()) {
      setMessage("Please enter a company.");
      return;
    }

    try {
      await saveInternshipEntry({
        familyId: profile.familyId,
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
    () => entries.filter((entry) => entry.status === "active"),
    [entries]
  );

  const interviewingEntries = useMemo(
    () => entries.filter((entry) => entry.status === "interviewing"),
    [entries]
  );

  const offeredEntries = useMemo(
    () => entries.filter((entry) => entry.status === "offered"),
    [entries]
  );

  const uniqueCompanies = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.company).filter(Boolean))),
    [entries]
  );

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Internship" />

        <div className="opennest-hero-card">
          <div className="opennest-card-title">Your career tracker</div>
          <div className="opennest-card-subtitle">
            Keep your internship pipeline, active roles, milestones, blockers,
            and company timeline in one clear place.
          </div>
        </div>

        <div className="opennest-summary-grid">
          <SummaryCard label="Active" value={activeInternships.length} />
          <SummaryCard label="Interviewing" value={interviewingEntries.length} />
          <SummaryCard label="Offers" value={offeredEntries.length} />
          <SummaryCard label="Companies Tracked" value={uniqueCompanies.length} />
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
            Internship Board
          </button>
        </div>

        {activeTab === "dashboard" && (
          <div className="opennest-module-grid">
            <div className="opennest-section">
              <DashboardCard
                title="Current / Active Internships"
                accentClass="opennest-module-accent-internship"
              >
                <div className="opennest-list">
                  {activeInternships.length > 0 ? (
                    activeInternships.map((entry) => (
                      <div key={entry.id} className="opennest-list-card">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="opennest-list-title">
                              {entry.company}
                            </div>
                            <div className="opennest-list-meta">
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

                        <div className="opennest-meta-grid">
                          <div>
                            <strong>Status:</strong> {entry.status || "-"}
                          </div>
                          <div>
                            <strong>Milestone:</strong> {entry.milestone || "-"}
                          </div>
                          <div>
                            <strong>Blocker:</strong> {entry.blocker || "-"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="opennest-empty-state">
                      No active internships yet.
                    </div>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard title="Internship Pipeline">
                <div className="opennest-list">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <div key={entry.id} className="opennest-list-card">
                        <div className="opennest-list-title">{entry.company}</div>
                        <div className="opennest-list-meta">
                          {entry.status} · {entry.startDate || "-"} →{" "}
                          {entry.endDate || "-"}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="opennest-empty-state">
                      No pipeline entries yet.
                    </div>
                  )}
                </div>
              </DashboardCard>

              <DashboardCard title="Milestones & Blockers">
                <div className="opennest-list">
                  {entries.length > 0 ? (
                    entries.map((entry) => (
                      <div key={entry.id} className="opennest-list-card">
                        <div className="opennest-list-title">{entry.company}</div>
                        <div className="opennest-meta-grid">
                          <div>
                            <strong>Milestone:</strong> {entry.milestone || "-"}
                          </div>
                          <div>
                            <strong>Blocker:</strong> {entry.blocker || "-"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="opennest-empty-state">
                      No milestone data yet.
                    </div>
                  )}
                </div>
              </DashboardCard>
            </div>

            <div className="opennest-section">
              <DashboardCard
                title="Add Internship Entry"
                accentClass="opennest-module-accent-internship"
              >
                <div className="opennest-form">
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

                  <button
                    type="button"
                    onClick={handleSave}
                    className="opennest-button opennest-button-primary"
                  >
                    Save Internship
                  </button>

                  {message && <div className="opennest-list-meta">{message}</div>}
                </div>
              </DashboardCard>
            </div>
          </div>
        )}

        {activeTab === "board" && (
          <DashboardCard
            title="Internship Board"
            accentClass="opennest-module-accent-internship"
          >
            <div className="opennest-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div key={entry.id} className="opennest-list-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="opennest-list-title">{entry.company}</div>
                        <div className="opennest-list-meta">
                          {entry.status} · {entry.startDate || "-"} →{" "}
                          {entry.endDate || "Ongoing"}
                        </div>
                      </div>

                      <Link
                        href={`/entry/internship/${entry.id}`}
                        className="underline text-sm"
                      >
                        Open
                      </Link>
                    </div>

                    <div className="opennest-meta-grid">
                      <div>
                        <strong>Milestone:</strong> {entry.milestone || "-"}
                      </div>
                      <div>
                        <strong>Blocker:</strong> {entry.blocker || "-"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="opennest-empty-state">
                  No internship entries yet.
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