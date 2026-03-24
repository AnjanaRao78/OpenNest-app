"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { subscribeToAuth, getUserProfile } from "@/lib/auth";
import { loadReflections } from "@/lib/reflections";
import { ReflectionPost } from "@/types/reflection";
import { canUserSeeReflection } from "@/lib/reflectionVisibility";
import PageHeader from "@/components/PageHeader";
import Link from "next/link";

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<ReflectionPost[]>([]);
  const [loading, setLoading] = useState(true);

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

        setPosts(filtered.sort((a, b) => b.createdAt - a.createdAt));
      } catch (error) {
        console.error("Failed to load feed:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <PageHeader title="Feed" />

      <div className="p-6 max-w-2xl mx-auto">
        {!user && <p>Please sign in first.</p>}

        {user && posts.length === 0 && <p>No reflections available.</p>}

        {posts.map((post) => (
          <div key={post.id} className="border rounded p-4 mb-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold">{post.authorName}</p>

              {post.id && (
                <Link
                  href={`/entry/reflection/${post.id}`}
                  className="text-sm underline"
                >
                  Open
                </Link>
              )}
            </div>

            <p><strong>Mood:</strong> {post.mood || "-"}</p>
            <p><strong>Highlight:</strong> {post.highlight || "-"}</p>
            <p><strong>Challenge:</strong> {post.challenge || "-"}</p>
            <p><strong>Need:</strong> {post.needType || "-"}</p>
            <p className="text-sm text-gray-500 mt-2">
              Visibility: {post.visibility}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}