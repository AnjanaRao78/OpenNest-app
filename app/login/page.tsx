"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";
import { signInWithGoogle, getUserProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setStatus("Signing in...");

      const user = await signInWithGoogle();
      setStatus("Checking profile...");

      const profile = await getUserProfile(user.uid);

      if (!profile?.familyId || !profile?.relationship) {
        setStatus("Redirecting to family setup...");
        router.replace("/onboarding");
        return;
      }

      setStatus("Opening home...");
      router.replace("/");
    } catch (error: unknown) {
      console.error("Google sign-in failed:", error);

      const message =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Sign-in failed.";

      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Welcome" />

        <div
          style={{
            display: "grid",
            justifyItems: "center",
            textAlign: "center",
            marginBottom: 22,
            paddingTop: 8,
          }}
        >
          <Image
            src="/opennest-logo.png"
            alt="OpenNest"
            width={180}
            height={60}
            style={{
              objectFit: "contain",
              marginBottom: 12,
            }}
          />

          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "var(--on-text)",
              lineHeight: 1.05,
              marginBottom: 8,
            }}
          >
            OpenNest
          </div>

          <div
            style={{
              fontSize: 15,
              lineHeight: 1.5,
              color: "var(--on-text-soft)",
              maxWidth: 540,
            }}
          >
            A shared family space for reflection, rhythm, and the threads of daily life.
          </div>
        </div>

        <div className="opennest-hero-card" style={{ marginBottom: 18 }}>
          <div className="opennest-card-title">
            Stay close, even when life stretches the map
          </div>
          <div className="opennest-card-subtitle">
            Sign in to enter your family space. If your family and relationship
            are not set yet, OpenNest will guide you there first.
          </div>
        </div>

        <div className="opennest-card">
          <div className="opennest-form">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="opennest-button opennest-button-primary"
            >
              {loading ? "Signing in..." : "Continue with Gmail"}
            </button>

            <div className="opennest-list-meta">
              Login → Family Setup → Home
            </div>

            {status && <div className="opennest-list-meta">{status}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}