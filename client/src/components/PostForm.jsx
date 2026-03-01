// src/pages/PostForm.jsx
import { useState } from "react";
import postApi from "../api/postApi";

import toast from 'react-hot-toast';

function PostForm({ onPostCreated }) {
  const [text, setText] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && mediaFiles.length === 0) {
      toast.error("Vui lòng nhập nội dung hoặc chọn ảnh/video!");
      return;
    }

    const formData = new FormData();
    formData.append("content", text);
    if (mediaFiles.length) {
      mediaFiles.forEach(file => {
        if (file.type.startsWith('image/')) formData.append('images', file);
        else if (file.type.startsWith('video/')) formData.append('videos', file);
        else formData.append('media', file);
      });
    }

    // Log FormData for debugging
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    const token = localStorage.getItem("token");
    console.log("Token exists:", !!token);
    console.log("Token preview:", token?.substring(0, 50) + "...");

    try {
      setLoading(true);
      const res = await postApi.createPost(formData);
      const successMsg = res?.data?.message || "Đăng bài thành công!";
      toast.success(successMsg);
    setText("");
    setMediaFiles([]);
    setPreviews([]);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Post create error:", err);
      console.error("Error response:", err?.response?.data);
      const serverMsg = err?.response?.data?.message || err?.message || "Lỗi khi đăng bài!";
      toast.error(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 max-w-2xl mx-auto mb-6 transition-all hover:shadow-lg">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Đăng bài mới</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          placeholder="Bạn đang nghĩ gì?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 p-4 border border-gray-200 rounded-lg outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 text-gray-900 placeholder-gray-500"
        ></textarea>

        <div className="relative">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="px-4 py-3 border border-gray-200 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all"
          />
        </div>

        {previews.length > 0 && (
          <div className="preview grid grid-cols-2 gap-3">
            {previews.map((p, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden shadow-sm border border-gray-200">
                {mediaFiles[idx]?.type.startsWith('image/') ? (
                  <img src={p} alt={`preview-${idx}`} className="w-full h-40 object-cover" />
                ) : (
                  <video src={p} controls className="w-full h-40 object-cover" />
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary mt-2 px-6 py-3 text-white font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Đang đăng..." : "Đăng bài"}
        </button>
      </form>
    </div>
  );
}

export default PostForm;
