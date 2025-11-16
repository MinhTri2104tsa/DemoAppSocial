// src/pages/Home.jsx
import { useEffect, useState } from "react";
import postApi from "../api/postApi";
import PostCard from "../components/PostCard";
import socket from "../socketClient";

function Home() {
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    try {
      const res = await postApi.getPosts();
      const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setPosts(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts();
    // listen to socket events to refresh posts in real-time
    socket.on('postUpdated', ({ postId }) => {
      fetchPosts();
    });
    socket.on('postsUpdated', () => {
      fetchPosts();
    });
    socket.on('commentsUpdated', ({ postId }) => {
      fetchPosts();
    });
    return () => {
      socket.off('postUpdated');
      socket.off('commentsUpdated');
    };
  }, []);

  return (
    <div className="min-h-screen bg-instagram-light">
      {/* Posts Feed */}
      <div className="max-w-2xl mx-auto py-8 px-4">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-instagram-textSecondary text-lg">
              Chưa có bài viết nào. Hãy tạo bài đầu tiên! 📝
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((p) => (
              <div key={p.id} className="flex justify-center">
                <PostCard post={p} onUpdate={fetchPosts} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
