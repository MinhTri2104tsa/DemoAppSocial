import { useEffect, useState } from "react";
import commentApi from "../api/commentApi";
import socket from "../socketClient";
import { getUser } from "../utils/auth";

import toast from 'react-hot-toast';
import Modal from './Modal';

function CommentItem({ c, replies, onReplyClick, onEditClick, onDeleteClick, isAuthor }) {
  return (
    <div className="py-2 border-l-2 border-blue-100 pl-3">
      <div className="flex items-center justify-between">
        <div>
          <b className="font-semibold text-sm text-gray-900">{c.username}</b>
          <span className="text-xs text-gray-500 ml-2">{new Date(c.created_at).toLocaleString('vi-VN')}</span>
        </div>
      </div>
      <div className="text-sm text-gray-700 mt-1">{c.content}</div>
      <div className="flex gap-3 mt-2 text-xs">
        <button onClick={() => onReplyClick(c.id, c.username)} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Trả lời</button>
        {isAuthor && (
          <>
            <button onClick={() => onEditClick(c.id, c.content)} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Chỉnh sửa</button>
            <button onClick={() => onDeleteClick(c.id)} className="text-red-500 hover:text-red-700 font-medium hover:underline">Xóa</button>
          </>
        )}
      </div>

      {/* replies */}
      {replies?.length > 0 && (
        <div className="mt-3 ml-4 space-y-2 pt-2 border-t border-gray-100">
          {replies.map(r => (
            <div key={r.id} className="text-sm">
              {r.parentUsername && (
                <div className="text-xs text-gray-500 mb-1">Trả lời <span className="font-semibold">@{r.parentUsername}</span></div>
              )}
              <b className="font-semibold text-sm text-gray-900">{r.username}</b>
              <div className="text-gray-700 text-sm">{r.content}</div>
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
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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
      if (err?.response?.status === 401) toast.error('Bạn cần đăng nhập để bình luận.');
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

  const handleDelete = (id) => {
    // show modal
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    const id = deleteConfirmId;
    setDeleteConfirmId(null);
    try {
      await commentApi.deleteComment(id, { postId });
      toast.success('Xóa bình luận thành công');
      await loadComments();
    } catch (err) {
      console.error('Failed to delete comment', err);
      toast.error('Lỗi khi xóa bình luận');
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
    <>
      <Modal isOpen={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)}>
        <p className="text-gray-800">Bạn chắc chắn muốn xóa bình luận này?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setDeleteConfirmId(null)}
          >Hủy</button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={confirmDelete}
          >Xóa</button>
        </div>
      </Modal>
      <div className="mt-4">
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
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
              <div className="ml-6 mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xs text-blue-700 font-medium mb-2">Đang trả lời @{replyTo?.username}</div>
                <input 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  placeholder={`Trả lời @${replyTo?.username}`} 
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white" 
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleReplySubmit()} 
                    className="px-4 py-1 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all text-sm"
                  >
                    Gửi
                  </button>
                  <button 
                    onClick={() => setReplyTo(null)} 
                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Inline edit UI */}
            {editingId === c.id && (
              <div className="mt-2 ml-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <textarea 
                  value={editingText} 
                  onChange={(e) => setEditingText(e.target.value)} 
                  className="w-full border border-yellow-200 rounded-lg p-2 text-sm focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100" 
                />
                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => handleEditSubmit(c.id)} 
                    className="px-4 py-1 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-all text-sm"
                  >
                    Lưu
                  </button>
                  <button 
                    onClick={() => { setEditingId(null); setEditingText(''); }} 
                    className="px-4 py-1 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
        <input
          className="border border-gray-200 rounded-lg px-4 py-2 flex-1 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-gray-50 placeholder-gray-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết bình luận..."
        />
        <button className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all text-sm">
          Gửi
        </button>
      </form>
    </div>
    </>

  );
}
