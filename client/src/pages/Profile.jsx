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
    <div className="min-h-screen bg-instagram-light">
      {/* Profile Header */}
      <div className="bg-white border-b border-instagram-border">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex gap-8 items-start mb-8">
            {/* Avatar */}
            <div className="relative">
              <img
                src={getFullAvatarUrl(user?.avatar)}
                alt="profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-instagram-border"
              />
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-8 h-8 opacity-0 absolute inset-0 cursor-pointer"
                    title="Change avatar"
                  />
                  <div className="w-8 h-8 flex items-center justify-center text-sm">✏️</div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold text-instagram-text">
                  {user?.username || "User"}
                </h1>
                <div className="flex items-center gap-3">
                  <button onClick={handleEditToggle} className="px-4 py-2 border rounded-lg font-semibold">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mb-6">
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-instagram-text">{userPosts.length}</span>
                  <span className="text-instagram-textSecondary text-sm">bài viết</span>
                </div>
               
              </div>

              {/* Bio / Edit Form */}
              <div>
                {!isEditing ? (
                  <>
                    <p className="text-instagram-text font-semibold mb-1">
                      {user?.name || "User Name"}
                    </p>
                    <p className="text-instagram-textSecondary text-sm">
                      Creating amazing content | {user?.email}
                    </p>
                  </>
                ) : (
                  <form onSubmit={handleSave} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium">Username</label>
                      <input name="username" value={form.username} onChange={handleInput} className="mt-1 block w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input name="email" value={form.email} onChange={handleInput} className="mt-1 block w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Avatar</label>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-16 h-16 rounded-full overflow-hidden border">
                          <img src={avatarPreview || getFullAvatarUrl(user?.avatar)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                        <input type="file" accept="image/*" onChange={handleAvatarChange} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary  px-4 py-2 border rounded">Save</button>
                      <button type="button" onClick={handleEditToggle} className="px-4 py-2 border rounded">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-instagram-border sticky top-12 z-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-center gap-8">
            <button 
              onClick={() => setActiveTab('posts')}
              className={`py-3 px-4 font-semibold border-b-2 transition-all ${
                activeTab === 'posts' 
                  ? 'text-instagram-text border-instagram-text' 
                  : 'text-instagram-textSecondary border-transparent hover:text-instagram-text'
              }`}
            >
              📸 Bài viết
            </button>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'posts' && (
          <>
            {loadingPosts ? (
              <div className="text-center py-12">
                <p className="text-instagram-textSecondary">Đang tải bài viết...</p>
              </div>
            ) : userPosts.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {userPosts.map(post => (
                  <div 
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="aspect-square bg-instagram-border rounded-lg hover:opacity-80 transition-all cursor-pointer overflow-hidden shadow-sm relative group"
                  >
                    {/* Display first media if available */}
                    {post.media && post.media.length > 0 ? (
                      <>
                        {post.media[0].type === 'image' ? (
                          <img 
                            src={`http://localhost:4000/${post.media[0].url}`}
                            alt="post"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video 
                            src={`http://localhost:4000/${post.media[0].url}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-instagram-divider to-instagram-border">
                        <span className="text-4xl">📝</span>
                      </div>
                    )}
                    
                    {/* Hover overlay with stats */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold">❤️ {post.likes || 0}</div>
                        <div className="text-sm">Thích</div>
                      </div>
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold">💬 {post.comments || 0}</div>
                        <div className="text-sm">Bình luận</div>
                      </div>
                    </div>

                    {/* Multi-media badge */}
                    {post.media && post.media.length > 1 && (
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold text-instagram-text">
                        +{post.media.length - 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-instagram-textSecondary">
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
