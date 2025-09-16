"use client";
import { useState } from "react";

export default function LikeButton({ blogId, initialCount }) {
  const [likeCount, setLikeCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading || liked) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.everestkit.com/api/blogs/${blogId}/like`, { method: "POST" });

      if (res.ok) {
        const data = await res.json();
        // Ensure `likes` exists in the response or fall back to increment
        const newCount = typeof data.likes === "number" ? data.likes : likeCount + 1;
        setLikeCount(newCount);
        setLiked(true);
      } else {
        const errorText = await res.text();
        console.error("Failed to like:", res.status, errorText);
      }
    } catch (err) {
      console.error("Error liking blog:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span
      onClick={handleLike}
      className={`flex items-center cursor-pointer ${
        liked ? "text-green-600" : "text-gray-500"
      }`}
    >
      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {likeCount}
    </span>
  );
}
