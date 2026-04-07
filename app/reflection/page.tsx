"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadReflections, saveReflection } from "@/lib/reflections";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";
import { VisibilityScope } from "@/types/reflection";

export default function ReflectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [highlight, setHighlight] = useState("");
  const [challenge, setChallenge] = useState("");
  const [mood, setMood] = useState("");
  const [needType, setNeedType] = useState("");
  const [visibility, setVisibility] = useState<VisibilityScope>("everyone");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) return;

      const userProfile: any = await getUserProfile(authUser.uid);
      setProfile(userProfile);

      if (!userProfile) return;

      const data = await loadReflections(userProfile.familyId);
      setEntries(data);
    });

    return () => unsub();
  }, []);

  async function reloadEntries(familyId: string) {
    const data = await loadReflections(familyId);
    setEntries(data);
  }

  async function handleSave() {
    if (!user || !profile) {
      setMessage("Please complete login setup first.");
      return;
    }

    if (!highlight.trim()) {
      setMessage("Please enter a reflection.");
      return;
    }

    try {
      await saveReflection({
        familyId: profile.familyId,
        authorUid: user.uid,
        authorName: user.displayName || "Unknown",
        authorRelationship: profile.relationship,
        highlight,
        challenge,
        mood,
        needType,
        visibility: visibility as VisibilityScope,
        createdAt: Date.now(),
      });

      await reloadEntries(profile.familyId);

      setHighlight("");
      setChallenge("");
      setMood("");
      setNeedType("");
      setVisibility("everyone");
      setMessage("Reflection saved.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save reflection.");
    }
  }

  function formatDate(value?: number) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  }

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Reflection" />

        {/* HERO */}
        <div className="opennest-hero-card">
          <div className="opennest-card-title">Pause. Notice. Share.</div>
          <div className="opennest-card-subtitle">
            A quiet place to capture what mattered today—what lifted you,
            what stretched you, and what you might need next.
          </div>
        </div>

        {/* SUMMARY */}
        <div className="opennest-summary-grid">
          <SummaryCard label="Total Reflections" value={entries.length} />
          <SummaryCard
            label="With Mood"
            value={entries.filter((e) => e.mood).length}
          />
          <SummaryCard
            label="Needs Shared"
            value={entries.filter((e) => e.needType).length}
          />
          <SummaryCard
            label="Private Entries"
            value={entries.filter((e) => e.visibility === "onlyMe").length}
          />
        </div>

        <div className="opennest-module-grid">
          {/* LEFT: FEED */}
          <div className="opennest-section">
            <DashboardCard
              title="Recent Reflections"
              accentClass="opennest-module-accent-reflection"
            >
              <div className="opennest-list">
                {entries.length === 0 && (
                  <div className="opennest-empty-state">
                    No reflections yet.
                  </div>
                )}

                {entries.map((entry) => (
                  <div key={entry.id} className="opennest-list-card teal">
                    <div className="flex justify-between gap-3">
                      <div>
                        <div className="opennest-list-title">
                          {entry.highlight}
                        </div>
                        <div className="opennest-list-meta">
                          {entry.authorName} · {formatDate(entry.createdAt)}
                        </div>
                      </div>

                      <Link
                        href={`/entry/reflection/${entry.id}`}
                        className="underline text-sm"
                      >
                        Open
                      </Link>
                    </div>

                    <div className="opennest-meta-grid">
                      <div>
                        <strong>Mood:</strong> {entry.mood || "-"}
                      </div>
                      <div>
                        <strong>Challenge:</strong> {entry.challenge || "-"}
                      </div>
                      <div>
                        <strong>Need:</strong> {entry.needType || "-"}
                      </div>
                    </div>

                    <div className="opennest-pill-row" style={{ marginTop: 10 }}>
                      <span className="opennest-pill teal">
                        {entry.visibility}
                      </span>
                      {entry.authorRelationship && (
                        <span className="opennest-pill">
                          {entry.authorRelationship}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </div>

          {/* RIGHT: FORM */}
          <div className="opennest-section">
            <DashboardCard
              title="Write Reflection"
              accentClass="opennest-module-accent-reflection"
            >
              <div className="opennest-form">
                <textarea
                  placeholder="What stood out today?"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                />

                <textarea
                  placeholder="What was challenging?"
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                />

                <input
                  placeholder="Mood (e.g. calm, anxious, excited)"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                />

                <select
                  value={needType}
                  onChange={(e) => setNeedType(e.target.value)}
                >
                  <option value="">Need (optional)</option>
                  <option value="listening">Listening</option>
                  <option value="advice">Advice</option>
                  <option value="space">Space</option>
                  <option value="celebrate">Celebrate</option>
                  <option value="practical">Practical help</option>
                </select>

                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as VisibilityScope)}
                >
                  <option value="everyone">Everyone</option>
                  <option value="parentsOnly">Parents only</option>
                  <option value="siblingOnly">Sibling only</option>
                  <option value="onlyMe">Only me</option>
                </select>

                <button
                  type="button"
                  onClick={handleSave}
                  className="opennest-button opennest-button-primary"
                >
                  Save Reflection
                </button>

                {message && (
                  <div className="opennest-list-meta">{message}</div>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}