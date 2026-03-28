"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadReflections } from "@/lib/reflections";
import { ReflectionPost } from "@/types/reflection";
import { canUserSeeReflection } from "@/lib/reflectionVisibility";
import PageHeader from "@/components/PageHeader";

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<ReflectionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsub = subscribeToAuth(async (authUser) => {
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(authUser.uid);
        setProfile(userProfile);

        if (!userProfile) {
          setPosts([]);
          setMessage("Please complete your family setup first.");
          setLoading(false);
          return;
        }

        const data = await loadReflections(userProfile.familyId);

        const filtered = data.filter((post) =>
          canUserSeeReflection(post, {
            uid: authUser.uid,
            familyId: userProfile.familyId,
            relationship: userProfile.relationship,
          })
        );

        const sorted = filtered.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(sorted);
        setMessage("");
      } catch (error) {
        console.error("Failed to load feed:", error);
        setPosts([]);
        setMessage("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  function formatDateTime(value: number) {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function visibilityLabel(value: string) {
    switch (value) {
      case "everyone":
        return "Everyone";
      case "parentsOnly":
        return "Parents only";
      case "siblingOnly":
        return "Sibling only";
      case "onlyMe":
        return "Only me";
      default:
        return value;
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div>
      <PageHeader title="Feed" />

      <div className="max-w-3xl mx-auto px-4 py-6">
        {!user && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">Please sign in first.</p>
            <Link href="/login" className="underline text-sm mt-3 inline-block">
              Go to login
            </Link>
          </div>
        )}

        {user && message && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm mb-4">
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        )}

        {user && !message && posts.length === 0 && (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-600">No reflections available.</p>
          </div>
        )}

        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="font-semibold text-base">{post.authorName}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDateTime(post.createdAt)}
                  </div>
                </div>

                {post.id && (
                  <Link
                    href={`/entry/reflection/${post.id}`}
                    className="text-sm underline shrink-0"
                  >
                    Open
                  </Link>
                )}
              </div>

              <div className="grid gap-2 text-sm">
                <p>
                  <strong>Mood:</strong> {post.mood || "-"}
                </p>
                <p>
                  <strong>Highlight:</strong> {post.highlight || "-"}
                </p>
                <p>
                  <strong>Challenge:</strong> {post.challenge || "-"}
                </p>
                <p>
                  <strong>Need:</strong> {post.needType || "-"}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs border bg-gray-50 text-gray-700">
                  {visibilityLabel(post.visibility)}
                </span>

                <span className="px-3 py-1 rounded-full text-xs border bg-gray-50 text-gray-700">
                  {post.authorRelationship}
                </span>

                {profile?.relationship && (
                  <span className="px-3 py-1 rounded-full text-xs border bg-gray-50 text-gray-700">
                    viewer: {profile.relationship}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}