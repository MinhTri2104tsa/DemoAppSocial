import { Link, useNavigate } from "react-router-dom";
import { getUser, removeToken, removeUser } from "../utils/auth";
import { Home, PlusSquare, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

// toast notifications
import toast from 'react-hot-toast';

export default function Sidebar({ onOpenCreate }) {
  const [user, setUser] = useState(getUser());
  useEffect(() => {
    const onUserUpdated = (e) => {
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
    window.dispatchEvent(new Event('authStateChanged'));
    toast.success('Đã đăng xuất');
    navigate("/login");
  };

  const navItems = [
    { icon: Home, label: "Trang chủ", path: "/" },
    { icon: User, label: "Hồ sơ", path: "/profile" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto z-40 shadow-sm">
      {/* Logo */}
      <div className="p-8 border-b border-gray-100">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
          Postly
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 p-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onMouseEnter={() => setIsHovered(item.path)}
              onMouseLeave={() => setIsHovered(null)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group font-medium ${
                isHovered === item.path
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon
                size={22}
                className="transition-colors"
              />
              <span className="text-base">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Create Button */}
        <button
          onClick={onOpenCreate}
          className="w-full btn-primary flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-semibold mt-6"
        >
          <PlusSquare size={20} />
          <span>Tạo bài mới</span>
        </button>
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
        {user && (
          <div className="p-6">
            {/* User Info */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50">
              <img
                src={user?.avatar ? `http://localhost:4000/${user.avatar}` : '/default-avatar.png'}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.username || user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all shadow-sm"
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