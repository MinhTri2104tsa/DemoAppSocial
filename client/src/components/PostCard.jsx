// src/components/PostCard.jsx
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';
import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { getUser } from '../utils/auth';
import postApi from '../api/postApi';

import toast from 'react-hot-toast';
import Modal from './Modal';

function PostCard({ post, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideos, setPreviewVideos] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentUser = getUser();
  
  // Check if current user is the post author (coerce to number)
  const isAuthor = Number(currentUser?.id) === Number(post.user_id);
  
  // post.media is expected to be an array of {type, url}
  const mediaArray = Array.isArray(post?.media) ? post.media : (post?.media ? [post.media] : []);

  const handleDelete = () => {
    // open confirmation modal instead of native dialog
    setShowDeleteConfirm(true);
    setShowMenu(false);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await postApi.deletePost(post.id);
      toast.success('Xóa bài viết thành công!');
      if (onUpdate) onUpdate();
    } catch (err) {
      const server = err?.response?.data;
      console.error('Delete error:', err, server);
      const msg = server?.error || server?.message || JSON.stringify(server) || err.message;
      toast.error('Lỗi khi xóa bài viết: ' + msg);
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setEditImages(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewImages(urls);
  };

  const handleVideosChange = (e) => {
    const files = Array.from(e.target.files || []);
    setEditVideos(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviewVideos(urls);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error('Nội dung không được để trống!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', editContent);
      editImages.forEach(f => formData.append('images', f));
      editVideos.forEach(f => formData.append('videos', f));

      await postApi.updatePost(post.id, formData);
      toast.success('Cập nhật bài viết thành công!');
      setIsEditing(false);
  setEditImages([]);
  setEditVideos([]);
  setPreviewImages([]);
  setPreviewVideos([]);
      if (onUpdate) onUpdate();
    } catch (err) {
      const server = err?.response?.data;
      console.error('Update error:', err, server);
      const msg = server?.error || server?.message || JSON.stringify(server) || err.message;
      toast.error('Lỗi khi cập nhật bài viết: ' + msg);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-md mb-6 w-full max-w-2xl p-6 transition-all">
        <h3 className="text-lg font-bold mb-4 text-gray-900">Chỉnh sửa bài viết</h3>
        
        {/* Nội dung */}
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-32 p-4 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all bg-gray-50 text-gray-900"
          placeholder="Nội dung bài viết..."
        />

        {/* Preview ảnh/video mới */}
        <div className="mt-4 space-y-3">
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {previewImages.map((p, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <img src={p} alt={`preview-${idx}`} className="w-full h-40 object-cover" />
                  <button
                    onClick={() => {
                      const next = previewImages.filter((_, i) => i !== idx);
                      setPreviewImages(next);
                      setEditImages(editImages.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {previewVideos.length > 0 && (
            <div className="grid grid-cols-1 gap-3">
              {previewVideos.map((p, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <video src={p} controls className="w-full h-40 object-cover" />
                  <button
                    onClick={() => {
                      const next = previewVideos.filter((_, i) => i !== idx);
                      setPreviewVideos(next);
                      setEditVideos(editVideos.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút chọn ảnh/video */}
        <label className="block mt-4">
          <span className="text-sm font-medium text-gray-900 mb-2 block">Chọn ảnh (có thể chọn nhiều):</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>

        <label className="block mt-3">
          <span className="text-sm font-medium text-gray-900 mb-2 block">Chọn video (có thể chọn nhiều):</span>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideosChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all btn-primary"
          >
            Lưu
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setEditImages([]);
              setEditVideos([]);
              setPreviewImages([]);
              setPreviewVideos([]);
              setEditContent(post.content);
            }}
            className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-all btn-secondary"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <p className="text-gray-800">Bạn chắc chắn muốn xóa bài viết này?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setShowDeleteConfirm(false)}
          >Hủy</button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            onClick={confirmDelete}
          >Xóa</button>
        </div>
      </Modal>
      <div className="bg-white border border-gray-200 rounded-xl shadow-md mb-6 w-full max-w-2xl transition-all hover:shadow-lg hover:border-gray-300">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img
            src={post.avatar ? `http://localhost:4000/${post.avatar}` : '/default-avatar.png'}
            alt="user"
            className="w-10 h-10 rounded-full object-cover border-2 border-blue-100"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm">{post.username || "Người dùng"}</span>
            <span className="text-xs text-gray-500">
              {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
            </span>
          </div>
        </div>

        {/* Menu 3 chấm - chỉ hiển thị nếu là author */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-600 hover:text-gray-900"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48 overflow-hidden">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-blue-50 transition-all text-gray-700 hover:text-blue-600 border-b border-gray-100 font-medium text-sm"
                >
                  <Edit2 size={16} />
                  <span>Chỉnh sửa</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 transition-all text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  <Trash2 size={16} />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <p className="px-4 py-3 text-gray-800 text-sm leading-relaxed">{post.content}</p>

      {/* Post Media - support carousel for multiple media */}
      {mediaArray.length > 0 && (
        <div className="w-full relative bg-gray-100">
          {mediaArray[currentMediaIndex].type === 'video' ? (
            <video src={`http://localhost:4000/${mediaArray[currentMediaIndex].url}`} controls className="w-full max-h-96 object-cover" />
          ) : (
            <img src={`http://localhost:4000/${mediaArray[currentMediaIndex].url}`} alt="post" className="w-full max-h-96 object-cover" />
          )}

          {mediaArray.length > 1 && (
            <>
              <button onClick={() => setCurrentMediaIndex((i) => (i - 1 + mediaArray.length) % mediaArray.length)} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all shadow-lg">‹</button>
              <button onClick={() => setCurrentMediaIndex((i) => (i + 1) % mediaArray.length)} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all shadow-lg">›</button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {mediaArray.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentMediaIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentMediaIndex ? 'bg-white w-6' : 'bg-white/60'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <LikeButton postId={post.id} onToggle={() => { if (onUpdate) onUpdate(); }} />
          <span className="cursor-pointer hover:text-gray-900 font-medium">💬 {post.comments || 0}</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="px-4 pb-3 border-t border-gray-100">
        <CommentSection postId={post.id} />
      </div>
    </div>
    </>
  );
}

export default PostCard;
