// src/components/PostCard.jsx
import CommentSection from './CommentSection';
import LikeButton from './LikeButton';
import { useState } from 'react';
import { MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { getUser } from '../utils/auth';
import postApi from '../api/postApi';

function PostCard({ post, onUpdate }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVideos, setPreviewVideos] = useState([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const currentUser = getUser();
  
  // Check if current user is the post author (coerce to number)
  const isAuthor = Number(currentUser?.id) === Number(post.user_id);
  
  // post.media is expected to be an array of {type, url}
  const mediaArray = Array.isArray(post?.media) ? post.media : (post?.media ? [post.media] : []);

  const handleDelete = async () => {
    if (window.confirm('Bạn chắc chắn muốn xóa bài viết này?')) {
      try {
        await postApi.deletePost(post.id);
        alert('Xóa bài viết thành công!');
        if (onUpdate) onUpdate();
      } catch (err) {
        const server = err?.response?.data;
        console.error('Delete error:', err, server);
        const msg = server?.error || server?.message || JSON.stringify(server) || err.message;
        alert('Lỗi khi xóa bài viết: ' + msg);
      }
      setShowMenu(false);
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
      alert('Nội dung không được để trống!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', editContent);
      editImages.forEach(f => formData.append('images', f));
      editVideos.forEach(f => formData.append('videos', f));

      await postApi.updatePost(post.id, formData);
      alert('Cập nhật bài viết thành công!');
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
      alert('Lỗi khi cập nhật bài viết: ' + msg);
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-instagram-border rounded-lg shadow-sm mb-6 w-full max-w-2xl p-4">
        <h3 className="text-lg font-bold mb-4 text-instagram-text">Chỉnh sửa bài viết</h3>
        
        {/* Nội dung */}
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full h-32 p-3 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary resize-none"
          placeholder="Nội dung bài viết..."
        />

        {/* Preview ảnh/video mới */}
        <div className="mt-4 space-y-3">
          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previewImages.map((p, idx) => (
                <div key={idx} className="relative">
                  <img src={p} alt={`preview-${idx}`} className="w-full h-40 object-cover rounded-lg" />
                  <button
                    onClick={() => {
                      const next = previewImages.filter((_, i) => i !== idx);
                      setPreviewImages(next);
                      setEditImages(editImages.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {previewVideos.length > 0 && (
            <div className="grid grid-cols-1 gap-2">
              {previewVideos.map((p, idx) => (
                <div key={idx} className="relative">
                  <video src={p} controls className="w-full h-40 object-cover rounded-lg" />
                  <button
                    onClick={() => {
                      const next = previewVideos.filter((_, i) => i !== idx);
                      setPreviewVideos(next);
                      setEditVideos(editVideos.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
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
          <span className="text-sm font-medium text-instagram-text mb-2 block">Chọn ảnh (có thể chọn nhiều):</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesChange}
            className="block w-full text-sm text-instagram-textSecondary"
          />
        </label>

        <label className="block mt-3">
          <span className="text-sm font-medium text-instagram-text mb-2 block">Chọn video (có thể chọn nhiều):</span>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleVideosChange}
            className="block w-full text-sm text-instagram-textSecondary"
          />
        </label>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-instagram-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
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
            className="px-4 py-2 bg-gray-200 text-instagram-text rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-instagram-border rounded-lg shadow-sm mb-6 w-full max-w-2xl">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 border-b border-instagram-divider">
        <div className="flex items-center gap-3">
          <img
            src={post.avatar ? `http://localhost:4000/${post.avatar}` : '/default-avatar.png'}
            alt="user"
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-instagram-text">{post.username || "Người dùng"}</span>
            <span className="text-xs text-instagram-textSecondary">
              {post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : ''}
            </span>
          </div>
        </div>

        {/* Menu 3 chấm - chỉ hiển thị nếu là author */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-instagram-light rounded-full transition-all"
            >
              <MoreVertical size={20} className="text-instagram-textSecondary" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-instagram-border rounded-lg shadow-lg z-10 min-w-40">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-instagram-light transition-all text-instagram-text border-b border-instagram-divider"
                >
                  <Edit2 size={16} />
                  <span className="font-medium">Chỉnh sửa</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 transition-all text-red-500"
                >
                  <Trash2 size={16} />
                  <span className="font-medium">Xóa</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <p className="px-4 py-3 text-instagram-text text-sm">{post.content}</p>

      {/* Post Media - support carousel for multiple media */}
      {mediaArray.length > 0 && (
        <div className="w-full relative">
          {mediaArray[currentMediaIndex].type === 'video' ? (
            <video src={`http://localhost:4000/${mediaArray[currentMediaIndex].url}`} controls className="w-full max-h-96 object-cover" />
          ) : (
            <img src={`http://localhost:4000/${mediaArray[currentMediaIndex].url}`} alt="post" className="w-full max-h-96 object-cover" />
          )}

          {mediaArray.length > 1 && (
            <>
              <button onClick={() => setCurrentMediaIndex((i) => (i - 1 + mediaArray.length) % mediaArray.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">‹</button>
              <button onClick={() => setCurrentMediaIndex((i) => (i + 1) % mediaArray.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full">›</button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {mediaArray.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentMediaIndex(idx)} className={`w-2 h-2 rounded-full ${idx === currentMediaIndex ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="border-t border-instagram-divider px-4 py-3">
        <div className="flex items-center justify-between text-sm text-instagram-textSecondary mb-3">
          <LikeButton postId={post.id} onToggle={() => { if (onUpdate) onUpdate(); }} />
          <span className="cursor-pointer hover:text-instagram-text">💬 {post.comments || 0}</span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="px-4 pb-3 border-t border-instagram-divider">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

export default PostCard;
