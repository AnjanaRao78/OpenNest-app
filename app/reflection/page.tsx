"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import {
  loadReflectionsForHome,
  loadReflectionAuthorsForFamily,
  saveReflection,
  ReflectionEntry,
} from "@/lib/reflections";
import PageHeader from "@/components/PageHeader";
import SummaryCard from "@/components/SummaryCard";
import DashboardCard from "@/components/DashboardCard";
import BottomNav from "@/components/BottomNav";
import { VisibilityScope } from "@/types/reflection";

type ReflectionTab = "write" | "dashboard";

export default function ReflectionPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [authors, setAuthors] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<ReflectionTab>("write");
  const [selectedAuthor, setSelectedAuthor] = useState("all");

  const [highlight, setHighlight] = useState("");
  const [challenge, setChallenge] = useState("");
  const [mood, setMood] = useState("");
  const [needType, setNeedType] = useState("");
  const [visibility, setVisibility] = useState<VisibilityScope>("everyone");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setEntries([]);
        setAuthors([]);
        setLoading(false);
        return;
      }

      try {
        const userProfile: any = await getUserProfile(authUser.uid);
        setProfile(userProfile);

        if (!userProfile?.familyId) {
          setEntries([]);
          setAuthors([]);
          setLoading(false);
          return;
        }

        const [reflectionData, authorData] = await Promise.all([
          loadReflectionsForHome(
            userProfile.familyId,
            authUser.uid,
            userProfile.relationship
          ),
          loadReflectionAuthorsForFamily(
            userProfile.familyId,
            authUser.uid,
            userProfile.relationship
          ),
        ]);

        setEntries(reflectionData);
        setAuthors(authorData);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load reflections.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  async function reloadEntries(familyId: string) {
    if (!user || !profile) return;

    const [reflectionData, authorData] = await Promise.all([
      loadReflectionsForHome(familyId, user.uid, profile.relationship),
      loadReflectionAuthorsForFamily(familyId, user.uid, profile.relationship),
    ]);

    setEntries(reflectionData);
    setAuthors(authorData);
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
        visibility,
        createdAt: Date.now(),
      });

      await reloadEntries(profile.familyId);

      setHighlight("");
      setChallenge("");
      setMood("");
      setNeedType("");
      setVisibility("everyone");
      setMessage("Reflection saved.");
      setActiveTab("dashboard");
      setSelectedAuthor("all");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save reflection.");
    }
  }

  function formatDate(value?: number) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  }

  const filteredEntries =
    selectedAuthor === "all"
      ? entries
      : entries.filter((entry) => entry.authorName === selectedAuthor);

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Reflection" />

        <div className="opennest-hero-card">
          <div className="opennest-card-title">Pause. Notice. Share.</div>
          <div className="opennest-card-subtitle">
            A quiet place to capture what mattered today—what lifted you,
            what stretched you, and what you might need next.
          </div>
        </div>

        <div className="opennest-card" style={{ marginTop: 16, marginBottom: 16 }}>
          <div className="opennest-list-meta" style={{ marginBottom: 8 }}>
            Reflection Space
          </div>

          <div className="opennest-pill-row">
            <button
              type="button"
              className={`opennest-pill ${activeTab === "write" ? "teal" : ""}`}
              onClick={() => {
                setActiveTab("write");
                setMessage("");
              }}
            >
              Write Reflection
            </button>

            <button
              type="button"
              className={`opennest-pill ${activeTab === "dashboard" ? "teal" : ""}`}
              onClick={() => {
                setActiveTab("dashboard");
                setMessage("");
              }}
            >
              Reflection Dashboard
            </button>
          </div>
        </div>

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

        {activeTab === "write" ? (
          <div className="opennest-module-grid">
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
                    onChange={(e) =>
                      setVisibility(e.target.value as VisibilityScope)
                    }
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

            <div className="opennest-section">
              <DashboardCard
                title="Writing Guidance"
                accentClass="opennest-module-accent-reflection"
              >
                <div className="opennest-list">
                  <div className="opennest-list-card teal">
                    <div className="opennest-list-title">Highlight</div>
                    <div className="opennest-list-meta">
                      Share the moment, idea, or feeling that stood out most today.
                    </div>
                  </div>

                  <div className="opennest-list-card gold">
                    <div className="opennest-list-title">Challenge</div>
                    <div className="opennest-list-meta">
                      Name what stretched you, even if it is still unresolved.
                    </div>
                  </div>

                  <div className="opennest-list-card">
                    <div className="opennest-list-title">Need</div>
                    <div className="opennest-list-meta">
                      Ask for listening, advice, space, celebration, or practical help.
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        ) : (
          <div className="opennest-module-grid">
            <div className="opennest-section">
              <DashboardCard
                title="Reflection Dashboard"
                accentClass="opennest-module-accent-reflection"
              >
                <div className="opennest-form" style={{ marginBottom: 16 }}>
                  <select
                    value={selectedAuthor}
                    onChange={(e) => setSelectedAuthor(e.target.value)}
                  >
                    <option value="all">All family members</option>
                    {authors.map((author) => (
                      <option key={author} value={author}>
                        {author}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="opennest-list">
                  {loading && (
                    <div className="opennest-empty-state">
                      Loading reflections...
                    </div>
                  )}

                  {!loading && filteredEntries.length === 0 && (
                    <div className="opennest-empty-state">
                      No reflections found for this view.
                    </div>
                  )}

                  {filteredEntries.map((entry) => (
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

                      <div
                        className="opennest-pill-row"
                        style={{ marginTop: 10 }}
                      >
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

            <div className="opennest-section">
              <DashboardCard
                title="Dashboard Notes"
                accentClass="opennest-module-accent-reflection"
              >
                <div className="opennest-list">
                  <div className="opennest-list-card teal">
                    <div className="opennest-list-title">Most recent first</div>
                    <div className="opennest-list-meta">
                      Reflections are sorted by latest activity so the freshest signal rises first.
                    </div>
                  </div>

                  <div className="opennest-list-card gold">
                    <div className="opennest-list-title">
                      Filter by family member
                    </div>
                    <div className="opennest-list-meta">
                      Narrow the view to one person when you want to notice patterns.
                    </div>
                  </div>

                  <div className="opennest-list-card">
                    <div className="opennest-list-title">Visibility respected</div>
                    <div className="opennest-list-meta">
                      Only reflections allowed by your existing visibility rules appear here.
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}