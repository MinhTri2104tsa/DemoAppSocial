// src/pages/PostForm.jsx
import { useState } from "react";
import postApi from "../api/postApi";

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
      alert("Vui lòng nhập nội dung hoặc chọn ảnh/video!");
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
      alert(successMsg);
    setText("");
    setMediaFiles([]);
    setPreviews([]);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error("Post create error:", err);
      console.error("Error response:", err?.response?.data);
      const serverMsg = err?.response?.data?.message || err?.message || "Lỗi khi đăng bài!";
      alert(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-instagram-text">Đăng bài mới</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          placeholder="Bạn đang nghĩ gì?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-24 p-3 border border-instagram-border rounded-lg outline-none resize-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary transition-all"
        ></textarea>

        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="px-3 py-2 border border-instagram-border rounded-lg cursor-pointer"
        />

        {previews.length > 0 && (
          <div className="preview grid grid-cols-2 gap-2">
            {previews.map((p, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden">
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
          className="w-full btn-primary mt-2 px-6 py-2 bg-instagram-primary text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "Đang đăng..." : "Đăng bài"}
        </button>
      </form>
    </div>
  );
}

export default PostForm;
