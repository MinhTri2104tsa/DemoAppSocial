import { Link, useNavigate } from "react-router-dom";
import { getUser, removeToken, removeUser } from "../utils/auth";
import { Home, PlusSquare, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

export default function Sidebar({ onOpenCreate }) {
  const [user, setUser] = useState(getUser());
  useEffect(() => {
    const onUserUpdated = (e) => {
      // event.detail contains updated user from Profile.jsx
      const updated = e?.detail || JSON.parse(localStorage.getItem('user'));
      setUser(updated);
    };
    const onStorage = (e) => {
      if (e.key === 'user') setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('userUpdated', onUserUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('userUpdated', onUserUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(null);

  const handleLogout = () => {
    removeToken();
    removeUser();
     // Emit event so App.js re-checks auth state
    window.dispatchEvent(new Event('authStateChanged'));
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: User, label: "Hồ sơ", path: "/profile" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-instagram-border overflow-y-auto z-40">
      {/* Logo */}
      <div className="p-6 border-b border-instagram-divider">
        <h1 className="text-3xl font-bold text-instagram-text">
          Postly
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4 p-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => setIsHovered(item.path)}
              onMouseLeave={() => setIsHovered(null)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${
                isHovered === item.path
                  ? "bg-instagram-light text-instagram-primary"
                  : "text-instagram-text hover:bg-instagram-light"
              }`}
            >
              <Icon
                size={24}
                className="group-hover:text-instagram-primary transition-colors"
              />
              <span className="text-lg font-semibold group-hover:text-instagram-primary transition-colors">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Create Button */}
        <button
          onClick={onOpenCreate}
          className="w-full btn-primary flex items-center gap-4 px-4 py-3 rounded-lg bg-instagram-primary text-white font-semibold hover:bg-blue-600 transition-all mt-4"
        >
          <PlusSquare size={24} />
          <span className="text-lg">Tạo bài mới</span>
        </button>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-instagram-divider bg-white">
        {user && (
          <div className="p-6">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user?.avatar ? `http://localhost:4000/${user.avatar}` : '/default-avatar.png'}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-instagram-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-instagram-text truncate">
                  {user?.username || user?.name}
                </p>
                <p className="text-xs text-instagram-textSecondary truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-lg font-semibold hover:bg-red-100 transition-all"
            >
              <LogOut size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}