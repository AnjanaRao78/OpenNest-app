"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, getUserProfile } from "@/lib/auth";
import PageHeader from "@/components/PageHeader";

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    try {
      setLoading(true);
      setStatus("");

      const user = await signInWithGoogle();
      const profile = await getUserProfile(user.uid);

      if (profile) {
        router.push("/");
      } else {
        router.push("/family");
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      setStatus(error?.message || "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="opennest-app-shell">
      <div className="opennest-page">
        <PageHeader title="Welcome" />

        <div className="opennest-hero-card" style={{ marginBottom: 16 }}>
          <div className="opennest-card-title">A shared space for family life</div>
          <div className="opennest-card-subtitle">
            OpenNest helps families stay close through reflections, studies,
            reading, routines, milestones, and the gentle texture of daily life.
          </div>
        </div>

        <div
          className="opennest-card"
          style={{
            padding: 20,
            display: "grid",
            gap: 16,
          }}
        >
          <div>
            <div className="opennest-card-title">Sign in with Gmail</div>
            <div className="opennest-card-subtitle">
              Join your family space, choose your role, and step into your
              shared calendar and updates.
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="opennest-button opennest-button-primary"
            style={{ width: "100%" }}
          >
            {loading ? "Signing in..." : "Continue with Gmail"}
          </button>

          <div className="opennest-card-subtitle">
            Built for families living apart, thinking together.
          </div>

          {status && (
            <div
              style={{
                border: "1px solid #f0d2cc",
                background: "#fff5f2",
                color: "#8a4f45",
                borderRadius: 16,
                padding: 12,
                fontSize: 14,
              }}
            >
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}