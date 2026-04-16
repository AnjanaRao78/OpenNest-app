"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import PageHeader from "@/components/PageHeader";
import {
  subscribeToAuth,
  getUserProfile,
  saveUserProfile,
} from "@/lib/auth";
import {
  createFamilyGroup,
  joinFamilyGroup,
  getFamilies,
  FamilyGroup,
  FamilyRelationship,
} from "@/lib/family";

export default function OnboardingPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const [mode, setMode] = useState<"join" | "create">("join");

  const [displayName, setDisplayName] = useState("");

  const [familyName, setFamilyName] = useState("");
  const [creatorRelationship, setCreatorRelationship] =
    useState<FamilyRelationship>("parent");

  const [families, setFamilies] = useState<FamilyGroup[]>([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinRelationship, setJoinRelationship] =
    useState<FamilyRelationship>("child");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile(authUser.uid);

        if (profile?.familyId && profile?.relationship) {
          router.replace("/");
          return;
        }

        setDisplayName(authUser.displayName || "");

        const familyList = await getFamilies();
        setFamilies(familyList);
      } catch (error) {
        console.error("Failed to load onboarding:", error);
        setStatus("Failed to load onboarding.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!selectedFamilyId) return;

    const selected = families.find((family) => family.id === selectedFamilyId);
    if (selected) {
      setJoinCode(selected.inviteCode || "");
    }
  }, [selectedFamilyId, families]);

  const selectedFamilyName = useMemo(() => {
    const selected = families.find((family) => family.id === selectedFamilyId);
    return selected?.name || "";
  }, [selectedFamilyId, families]);

  async function handleCreateFamily() {
    if (!user) return setStatus("Please sign in first.");
    if (!displayName.trim()) return setStatus("Please enter your name.");
    if (!familyName.trim()) return setStatus("Please enter a family name.");

    try {
      setSaving(true);
      setStatus("");

      const created = await createFamilyGroup(
        familyName.trim(),
        user.uid,
        displayName.trim(),
        creatorRelationship
      );

      await saveUserProfile({
        uid: user.uid,
        displayName: user.displayName || displayName.trim(),
        email: user.email || "",
        photoURL: user.photoURL || "",
        familyId: created.id,
        familyName: created.name,
        relationship: creatorRelationship,
      });

      router.replace("/");
    } catch (error) {
      console.error(error);
      setStatus("Failed to create family.");
    } finally {
      setSaving(false);
    }
  }

  async function handleJoinFamily() {
    if (!user) return setStatus("Please sign in first.");
    if (!displayName.trim()) return setStatus("Please enter your name.");
    if (!selectedFamilyId) return setStatus("Please select a family.");
    if (!joinCode.trim()) return setStatus("Please enter an invite code.");

    try {
      setSaving(true);
      setStatus("");

      const joined = await joinFamilyGroup(
        joinCode.trim().toUpperCase(),
        user.uid,
        displayName.trim(),
        joinRelationship
      );

      await saveUserProfile({
        uid: user.uid,
        displayName: user.displayName || displayName.trim(),
        email: user.email || "",
        photoURL: user.photoURL || "",
        familyId: joined.id,
        familyName: joined.name || selectedFamilyName,
        relationship: joinRelationship,
      });

      router.replace("/");
    } catch (error) {
      console.error(error);
      setStatus("Failed to join family.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="Onboarding" />
          <div className="opennest-card">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="opennest-app-shell">
        <div className="opennest-page">
          <PageHeader title="Onboarding" />
          <div className="opennest-card">
            <div className="opennest-card-title">Sign in required</div>
            <div className="opennest-card-subtitle">
              Please sign in first.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Set up your family" />

        <div className="opennest-hero-card" style={{ marginBottom: 16 }}>
          <div className="opennest-card-title">Choose how to begin</div>
          <div className="opennest-card-subtitle">
            Join an existing family by selecting it and confirming the invite
            code, or create a new family space.
          </div>
        </div>

        <div className="opennest-card" style={{ marginBottom: 16 }}>
          <div className="opennest-pill-row">
            <button
              type="button"
              className={`opennest-pill ${mode === "join" ? "teal" : ""}`}
              onClick={() => {
                setMode("join");
                setStatus("");
              }}
            >
              Join Family
            </button>

            <button
              type="button"
              className={`opennest-pill ${mode === "create" ? "teal" : ""}`}
              onClick={() => {
                setMode("create");
                setStatus("");
              }}
            >
              Create Family
            </button>
          </div>
        </div>

        <div className="opennest-card" style={{ marginBottom: 16 }}>
          <div className="opennest-form">
            <input
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        </div>

        {mode === "join" ? (
          <div className="opennest-card">
            <div className="opennest-card-title">Join Family</div>
            <div className="opennest-card-subtitle" style={{ marginBottom: 16 }}>
              Select a family, use the invite code, and choose your relationship.
            </div>

            <div className="opennest-form">
              <select
                value={selectedFamilyId}
                onChange={(e) => setSelectedFamilyId(e.target.value)}
              >
                <option value="">Select family</option>
                {families.map((family) => (
                  <option key={family.id} value={family.id}>
                    {family.name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Invite code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />

              <select
                value={joinRelationship}
                onChange={(e) =>
                  setJoinRelationship(e.target.value as FamilyRelationship)
                }
              >
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
              </select>

              <button
                type="button"
                onClick={handleJoinFamily}
                disabled={saving}
                className="opennest-button opennest-button-primary"
              >
                {saving ? "Joining..." : "Join Family"}
              </button>
            </div>
          </div>
        ) : (
          <div className="opennest-card">
            <div className="opennest-card-title">Create Family</div>
            <div className="opennest-card-subtitle" style={{ marginBottom: 16 }}>
              Start a new family space and become its first member.
            </div>

            <div className="opennest-form">
              <input
                placeholder="Family name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />

              <select
                value={creatorRelationship}
                onChange={(e) =>
                  setCreatorRelationship(e.target.value as FamilyRelationship)
                }
              >
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="child">Child</option>
              </select>

              <button
                type="button"
                onClick={handleCreateFamily}
                disabled={saving}
                className="opennest-button opennest-button-primary"
              >
                {saving ? "Creating..." : "Create Family"}
              </button>
            </div>
          </div>
        )}

        {status && (
          <div className="opennest-card" style={{ marginTop: 16 }}>
            <div className="opennest-list-meta">{status}</div>
          </div>
        )}
      </div>
    </div>
  );
}