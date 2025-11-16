// src/components/Navbar.jsx
import { getUser, isAuthenticated } from "../utils/auth";
import { Link } from "react-router-dom";

function Navbar() {
  const user = getUser();

  // Jika user sudah login, Navbar hanya menampilkan simple bar
  // Navbar kompleks untuk unauthenticated users
  if (isAuthenticated()) {
    return (
      <nav className="flex justify-between items-center px-6 py-3 bg-white border-b border-instagram-border sticky top-0 z-40">
        <h2 className="text-xl font-bold text-instagram-text">Bảng tin</h2>
        <div className="text-sm text-instagram-textSecondary">
          Xin chào, {user?.username || user?.name} 👋
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white border-b border-instagram-border shadow-sm sticky top-0 z-40">
      <div>
        <Link to="/" className="text-2xl font-bold text-instagram-text">
          📱 AppSocial
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/login"
          className="text-instagram-primary font-semibold hover:text-blue-600 transition-all"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="px-4 py-2 bg-instagram-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition-all"
        >
          Đăng ký
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
