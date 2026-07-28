"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { adminFetch } from "@/components/admin/useAdminData";
import { fmtUTC } from "@/lib/utils";

type AdminPost = {
  id: string;
  content: string;
  image_url: string | null;
  created_at: string;
  author: {
    id: string;
    name: string;
    callsign: string;
    email: string;
    avatar_url: string | null;
  } | null;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminFetch("/api/admin/posts");
    if (res.ok) {
      setPosts(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setBusyId(id);
    const res = await adminFetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not delete post.");
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
    setBusyId("");
  }

  if (loading) return <p className="section-sub">Loading posts…</p>;

  return (
    <div>
      <div className="admin-page-head">
        <div>
          <h1>CQ Feed Posts</h1>
          <p className="section-sub">{posts.length} posts. View author and delete inappropriate content.</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      <div className="admin-support-list">
        {posts.length === 0 && <p className="section-sub">No posts yet.</p>}
        {posts.map((post) => (
          <div key={post.id} className="admin-card">
            <div className="admin-card-head">
              <div>
                <strong className="no-cap">
                  {post.author?.callsign || "Unknown"}{" "}
                  {post.author?.name ? `(${post.author.name})` : ""}
                </strong>
                <p className="section-sub no-cap" style={{ marginTop: 4 }}>
                  {post.author?.email || "—"} · {fmtUTC(post.created_at)}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={busyId === post.id}
                onClick={() => void deletePost(post.id)}
                title="Delete post"
              >
                <Trash2 size={16} />
                {busyId === post.id ? "…" : "Delete"}
              </button>
            </div>
            {post.content ? <p className="support-message-body">{post.content}</p> : null}
            {post.image_url && (
              <div className="mt-2 rounded-xl overflow-hidden border border-gray-100 max-w-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image_url} alt="Post attachment" className="w-full max-h-48 object-cover" />
              </div>
            )}
            {post.author?.callsign && (
              <Link href={`/profile/${post.author.callsign}`} className="text-xs text-ham-purple underline mt-2 inline-block">
                View author profile
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
