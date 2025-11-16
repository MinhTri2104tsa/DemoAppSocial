import { useState, useContext } from "react";
import authApi from "../api/authApi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { setToken, setUser } from "../utils/auth";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.login(form);
      setToken(res.data.token);
      setUser(res.data.user);
      //   login(res.data.user, res.data.token);
      setMessage(" Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      setMessage("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-instagram-light">
      <div className="w-full max-w-sm bg-white border border-instagram-border rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-instagram-text">
          📱 AppSocial
        </h2>
        <h3 className="text-center text-instagram-textSecondary mb-6">
          Đăng nhập để tiếp tục
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            name="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />
          <button
            type="submit"
            className="w-full py-2 bg-instagram-primary text-white font-semibold rounded-lg hover:bg-blue-600 transition-all mt-2"
          >
            Đăng nhập
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
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-instagram-primary font-semibold hover:text-blue-600">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
