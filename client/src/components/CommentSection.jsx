import { useEffect, useState } from "react";
import commentApi from "../api/commentApi";
import socket from "../socketClient";
import { getUser } from "../utils/auth";

function CommentItem({ c, replies, onReplyClick, onEditClick, onDeleteClick, isAuthor }) {
  return (
    <div className="py-1">
      <div className="flex items-center gap-2">
        <b className="font-semibold text-sm">{c.username}</b>
        <span className="text-xs text-instagram-textSecondary">{new Date(c.created_at).toLocaleString('vi-VN')}</span>
      </div>
      <div className="text-sm text-instagram-textSecondary mt-1">{c.content}</div>
      <div className="flex gap-3 mt-1 text-xs text-instagram-textSecondary">
        <button onClick={() => onReplyClick(c.id, c.username)} className="hover:underline">Trả lời</button>
        {isAuthor && (
          <>
            <button onClick={() => onEditClick(c.id, c.content)} className="hover:underline">Chỉnh sửa</button>
            <button onClick={() => onDeleteClick(c.id)} className="hover:underline text-red-500">Xóa</button>
          </>
        )}
      </div>

      {/* replies */}
      {replies?.length > 0 && (
        <div className="mt-2 ml-6 border-l border-instagram-divider pl-3 space-y-2">
          {replies.map(r => (
            <div key={r.id} className="text-sm">
              {r.parentUsername && (
                <div className="text-xs text-instagram-textSecondary">Trả lời {r.parentUsername}</div>
              )}
              <b className="font-semibold text-sm">{r.username}</b>
              <div className="text-instagram-textSecondary">{r.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { id, username }
  const [replyText, setReplyText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const currentUser = getUser();

  useEffect(() => {
    loadComments();

    const onCommentsUpdated = (payload) => {
      if (payload?.postId === postId) {
        setComments(payload.comments || []);
      }
    };
    socket.on("commentsUpdated", onCommentsUpdated);

    return () => {
      socket.off("commentsUpdated", onCommentsUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const loadComments = async () => {
    try {
      const res = await commentApi.getComments(postId);
      setComments(res.data || []);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await commentApi.addComment({ postId, content: text });
      setText("");
      await loadComments();
    } catch (err) {
      console.error('Failed to add comment', err);
      if (err?.response?.status === 401) alert('Bạn cần đăng nhập để bình luận.');
    }
  };

  const handleReplySubmit = async () => {
    if (!replyText.trim() || !replyTo) return;
    try {
      await commentApi.addComment({ postId, content: replyText, parent_comment_id: replyTo.id });
      setReplyText("");
      setReplyTo(null);
      await loadComments();
    } catch (err) {
      console.error('Failed to add reply', err);
    }
  };

  const handleEditSubmit = async (id) => {
    if (!editingText.trim()) return;
    try {
      await commentApi.updateComment(id, { content: editingText, postId });
      setEditingId(null);
      setEditingText("");
      await loadComments();
    } catch (err) {
      console.error('Failed to update comment', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;
    try {
      await commentApi.deleteComment(id, { postId });
      await loadComments();
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  // build tree: top-level comments and replies map (attach parentUsername on replies)
  const topComments = comments.filter(c => !c.parent_comment_id);
  const repliesMap = {};
  comments.forEach(c => {
    if (c.parent_comment_id) {
      const parent = comments.find(pc => pc.id === c.parent_comment_id);
      c.parentUsername = parent ? parent.username : null;
      repliesMap[c.parent_comment_id] = repliesMap[c.parent_comment_id] || [];
      repliesMap[c.parent_comment_id].push(c);
    }
  });

  return (
    <div className="mt-3">
      <div className="space-y-3 mb-3 max-h-64 overflow-y-auto">
        {topComments.map((c) => (
          <div key={c.id} className="">
            <CommentItem
              c={c}
              replies={repliesMap[c.id]}
              onReplyClick={(id, username) => { setReplyTo({ id, username }); setReplyText(`@${username} `); }}
              onEditClick={(id, content) => { setEditingId(id); setEditingText(content); }}
              onDeleteClick={handleDelete}
              isAuthor={currentUser?.id === c.user_id}
            />

            {/* Reply input under the comment if active */}
            {replyTo?.id === c.id && (
              <div className="ml-6 mt-2">
                <div className="text-xs text-instagram-textSecondary mb-1">Đang trả lời @{replyTo?.username}</div>
                <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Trả lời @${replyTo?.username}`} className="w-full border border-instagram-border rounded-lg px-3 py-2 text-sm focus:outline-none" />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleReplySubmit()} className="px-3 py-1 bg-instagram-primary text-white rounded">Gửi</button>
                  <button onClick={() => setReplyTo(null)} className="px-3 py-1 bg-gray-200 rounded">Hủy</button>
                </div>
              </div>
            )}

            {/* Inline edit UI */}
            {editingId === c.id && (
              <div className="mt-2">
                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full border border-instagram-border rounded p-2" />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEditSubmit(c.id)} className="px-3 py-1 bg-instagram-primary text-white rounded">Lưu</button>
                  <button onClick={() => { setEditingId(null); setEditingText(''); }} className="px-3 py-1 bg-gray-200 rounded">Hủy</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-2 pt-2 border-t border-instagram-divider">
        <input
          className="border border-instagram-border rounded-lg px-3 py-2 flex-1 text-sm focus:border-instagram-primary focus:outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết bình luận..."
        />
        <button className="text-instagram-primary font-semibold hover:text-blue-600 transition-all">
          Gửi
        </button>
      </form>
    </div>
  );
}
