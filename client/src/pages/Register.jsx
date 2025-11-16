import { useState } from "react";
import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.register(form);
      // show backend message if available
      const successMsg = res?.data?.message || " Đăng ký thành công!";
      setMessage(successMsg);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      // Log full error for debugging
      console.error("Register error:", err);
      // Prefer server-provided message when available
      const serverMsg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra!";
      setMessage(` ${serverMsg}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-instagram-light">
      <div className="w-full max-w-sm bg-white border border-instagram-border rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-instagram-text">
          📱 AppSocial
        </h2>
        <h3 className="text-center text-instagram-textSecondary mb-6">
          Tạo tài khoản mới
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Tên người dùng"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />
          <button
            type="submit"
            className="w-full btn-primary mt-2"
          >
            Đăng ký
          </button>
        </form>

        {message && (
          <p
            className={`text-center mt-4 text-sm font-semibold ${
              message.includes("thành công")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <hr className="my-6 border-instagram-border" />

        <p className="text-center text-instagram-textSecondary text-sm">
          Đã có tài khoản?{" "}
          <a href="/login" className="text-instagram-primary font-semibold hover:text-blue-600">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
