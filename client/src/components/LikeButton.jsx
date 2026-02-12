import { useState, useEffect } from "react";
import likeApi from "../api/likeApi";
import socket from "../socketClient";

export default function LikeButton({ postId, onToggle }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);

  // load current like info
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await likeApi.getLikes(postId);
        const data = res.data || res;
        if (!mounted) return;
        setCount(Number(data.totalLikes || 0));
        setLiked(!!data.likedByUser);
      } catch (err) {
        console.error("Failed to load likes", err);
      }
    })();

    // listen for server broadcasts about this post
    const onPostUpdated = (payload) => {
      if (!payload) return;
      const id = payload.postId ?? payload;
      if (id === postId) {
        const total = payload.totalLikes ?? payload.totalLikes === 0 ? payload.totalLikes : null;
        if (total !== null && total !== undefined) setCount(Number(total));
      }
    };
    socket.on("postUpdated", onPostUpdated);

    return () => {
      mounted = false;
      socket.off("postUpdated", onPostUpdated);
    };
  }, [postId]);

  const toggleLike = async () => {
    try {
      const res = await likeApi.toggleLike(postId);
      const data = res.data || res;
      setCount(Number(data.totalLikes || 0));
      setLiked(!!data.likedByUser);
      // notify parent (optional) so it can refresh other parts of UI
      if (typeof onToggle === 'function') onToggle(data);
      // server will also broadcast to others; no need to emit from client
    } catch (err) {
      console.error("Like toggle failed", err);
      if (err?.response?.status === 401) alert("Bạn cần đăng nhập để thích bài viết.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={toggleLike} 
        className="text-2xl hover:scale-110 transition-transform"
        aria-pressed={liked}
        title={liked ? "Bỏ thích" : "Thích"}
      >
        {liked ? "❤️" : "🤍"}
      </button>
      <span className="text-sm font-medium text-gray-700">{Number.isFinite(count) ? count : 0}</span>
    </div>
  );
}
