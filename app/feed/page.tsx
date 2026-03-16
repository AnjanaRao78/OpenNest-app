"use client";

import { useEffect, useState } from "react";
import { loadReflections } from "@/lib/reflections";
import { ReflectionPost } from "@/types/reflection";

export default function FeedPage() {
  const [posts, setPosts] = useState<ReflectionPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadReflections("demo-family-1");
        const sorted = data.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(sorted);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Open-Nest Feed</h1>

      {posts.length === 0 && <p>No reflections yet.</p>}

      {posts.map((post) => (
        <div key={post.id} className="border rounded p-4 mb-4">
          <p className="font-semibold">{post.authorName}</p>
          <p>Mood: {post.mood}</p>
          <p><strong>Highlight:</strong> {post.highlight}</p>
          <p><strong>Challenge:</strong> {post.challenge}</p>
          <p><strong>Need:</strong> {post.needType}</p>
          <p className="text-sm text-gray-500">Visibility: {post.visibility}</p>
        </div>
      ))}
    </div>
  );
}