import { useState, useContext } from "react";
import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../utils/auth";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.login(form);
      setToken(res.data.token);
      setUser(res.data.user);
      setMessage(" Đăng nhập thành công!");
      window.dispatchEvent(new Event('authStateChanged'));
      setTimeout(() => navigate("/"), 100);
    } catch (err) {
      setMessage("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
            Postly
          </h2>
          <h3 className="text-gray-600 font-medium">
            Đăng nhập để tiếp tục
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all bg-gray-50 placeholder-gray-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Mật khẩu"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all bg-gray-50 placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            className="w-full btn-primary py-3 mt-2"
          >
            Đăng nhập
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-4 rounded-lg text-center text-sm font-semibold border ${
              message.includes("thành công")
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">hoặc</span>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
