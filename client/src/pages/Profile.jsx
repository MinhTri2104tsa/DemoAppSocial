import { useState, useEffect } from 'react';
import userApi from '../api/userApi';
import postApi from '../api/postApi';
import PostCard from '../components/PostCard';
import Modal from '../components/Modal';

export default function Profile() {
  const stored = JSON.parse(localStorage.getItem("user"));
  const [user, setUser] = useState(stored || null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: user?.username || '', email: user?.email || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'favorites', 'tagged'
  const [selectedPost, setSelectedPost] = useState(null); 

  useEffect(() => {
    setForm({ username: user?.username || '', email: user?.email || '' });
  }, [user]);

  // Fetch user's posts
  useEffect(() => {
    if (user?.id) {
      setLoadingPosts(true);
      postApi.getUserPosts(user.id)
        .then(res => {
          setUserPosts(res.data || []);
        })
        .catch(err => {
          console.error('Error fetching user posts:', err);
          setUserPosts([]);
        })
        .finally(() => setLoadingPosts(false));
    }
  }, [user?.id]);
  const getFullAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '/avatar.jpg';
    if (avatarPath.startsWith('http')) return avatarPath;
    // backend serves uploads at http://localhost:4000/
    return `http://localhost:4000/${avatarPath}`;
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setAvatarPreview(null);
    setAvatarFile(null);
  }

  const handleInput = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
  }

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    if (avatarFile) formData.append('avatar', avatarFile);
    try {
      const res = await userApi.updateProfile(formData);
      const updated = res.data.user;
      setUser(updated);
      localStorage.setItem('user', JSON.stringify({ id: updated.id, username: updated.username, email: updated.email, avatar: updated.avatar }));
      // notify other components (Sidebar, Navbar) that user changed
      try {
        window.dispatchEvent(new CustomEvent('userUpdated', { detail: updated }));
      } catch (e) {
        console.log('dispatch userUpdated failed', e);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Update profile error', err);
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
    }
  }
  const handlePostUpdate = () => {
    // Refresh posts after edit/delete
    if (user?.id) {
      postApi.getUserPosts(user.id)
        .then(res => {
          setUserPosts(res.data || []);
        })
        .catch(err => {
          console.error('Error refreshing user posts:', err);
        });
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex gap-12 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={getFullAvatarUrl(user?.avatar)}
                alt="profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 shadow-lg"
              />
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-600 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-6 h-6 opacity-0 absolute inset-0 cursor-pointer"
                    title="Change avatar"
                  />
                  <div className="w-6 h-6 flex items-center justify-center text-white text-lg">✏️</div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-4xl font-bold text-gray-900">
                  {user?.username || "User"}
                </h1>
                <button 
                  onClick={handleEditToggle} 
                  className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                    isEditing 
                      ? 'btn-secondary' 
                      : 'btn-primary'
                  }`}
                >
                  {isEditing ? 'Hủy' : 'Chỉnh sửa hồ sơ'}
                </button>
              </div>

              {/* Stats */}
              <div className="flex gap-12 mb-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-gray-900">{userPosts.length}</span>
                  <span className="text-gray-600 text-sm font-medium">bài viết</span>
                </div>
              </div>

              {/* Bio / Edit Form */}
              <div>
                {!isEditing ? (
                  <>
                    <p className="text-gray-900 font-semibold text-lg mb-2">
                      {user?.name || user?.username || "User Name"}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {user?.email}
                    </p>
                  </>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Tên người dùng</label>
                      <input 
                        name="username" 
                        value={form.username} 
                        onChange={handleInput} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                      <input 
                        name="email" 
                        value={form.email} 
                        onChange={handleInput} 
                        className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Ảnh đại diện</label>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100 shadow-md flex-shrink-0">
                          <img src={avatarPreview || getFullAvatarUrl(user?.avatar)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <label className="flex-1 px-4 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-all text-gray-600 font-medium text-center">
                          Chọn ảnh
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button type="submit" className="btn-primary px-6 py-2">Lưu</button>
                      <button type="button" onClick={handleEditToggle} className="btn-secondary px-6 py-2">Hủy</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-center gap-8">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-4 font-semibold border-b-2 transition-all text-sm ${
                activeTab === 'posts' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              📸 Bài viết
            </button>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {activeTab === 'posts' && (
          <>
            {loadingPosts ? (
              <div className="text-center py-16">
                <p className="text-gray-600 font-medium">Đang tải bài viết...</p>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-6">
                {userPosts.map(post => (
                  <div 
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square bg-gray-100 rounded-xl hover:shadow-lg transition-all cursor-pointer overflow-hidden shadow-md relative group border border-gray-200"
                  >
                    {/* Display first media if available */}
                    {post.media && post.media.length > 0 ? (
                      <>
                        {post.media[0].type === 'image' ? (
                          <img 
                            src={`http://localhost:4000/${post.media[0].url}`}
                            alt="post"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <video 
                            src={`http://localhost:4000/${post.media[0].url}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100">
                        <span className="text-5xl">📝</span>
                      </div>
                    )}
                    
                    {/* Hover overlay with stats */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100">
                      <div className="text-white text-center">
                        <div className="text-3xl font-bold">❤️ {post.likes || 0}</div>
                      </div>
                      <div className="text-white text-center">
                        <div className="text-3xl font-bold">💬 {post.comments || 0}</div>
                      </div>
                    </div>

                    {/* Multi-media badge */}
                    {post.media && post.media.length > 1 && (
                      <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-lg">
                        +{post.media.length - 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📸</div>
                <p className="text-gray-600 font-medium">
                  Chưa có bài viết nào
                </p>
              </div>
            )}
          </>
        )}
      </div>
      {/* Post Detail Modal */}
      <Modal isOpen={!!selectedPost} onClose={() => setSelectedPost(null)}>
        {selectedPost && (
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-instagram-border flex items-center justify-between px-4 py-3 z-10">
              <h3 className="text-lg font-bold text-instagram-text">Chi tiết bài viết</h3>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 hover:bg-instagram-divider rounded transition-all"
              >
                {/* <X size={20} className="text-instagram-text" /> */}
              </button>
            </div>
            <div className="p-4">
              <PostCard post={selectedPost} onUpdate={() => {
                handlePostUpdate();
                setSelectedPost(null);
              }} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
