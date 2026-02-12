// src/components/Navbar.jsx
import { getUser, isAuthenticated } from "../utils/auth";
import { Link } from "react-router-dom";

function Navbar() {
  const user = getUser();

  // Jika user sudah login, Navbar hanya menampilkan simple bar
  // Navbar kompleks untuk unauthenticated users
  if (isAuthenticated()) {
    return (
      <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Bảng tin</h2>
        <div className="text-sm text-gray-600 font-medium">
          Xin chào, <span className="font-semibold text-gray-900">{user?.username || user?.name}</span> 👋
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div>
        <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          Postly
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <Link
          to="/login"
          className="px-6 py-2 text-gray-700 font-semibold hover:text-blue-600 transition-all hover:bg-gray-100 rounded-lg"
        >
          Đăng nhập
        </Link>
        <Link
          to="/register"
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all shadow-md hover:shadow-lg"
        >
          Đăng ký
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
