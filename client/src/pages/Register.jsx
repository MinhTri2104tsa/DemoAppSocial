import { useState, useRef, useEffect } from "react";
import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null); // null=unknown, true/false
  const [validation, setValidation] = useState({
    passwordValid: false,
    passwordsMatch: false,
    emailSyntaxValid: true,
  });
  const navigate = useNavigate();

  const emailTimeout = useRef(null);
  useEffect(() => {
    return () => { if (emailTimeout.current) clearTimeout(emailTimeout.current); };
  }, []);

  const checkEmail = (email) => {
    if (emailTimeout.current) clearTimeout(emailTimeout.current);
    if (!email) return setEmailAvailable(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const syntaxOk = emailRegex.test(email);
    setValidation((v) => ({ ...v, emailSyntaxValid: syntaxOk }));
    if (!syntaxOk) {
      setEmailAvailable(null);
      return;
    }
    emailTimeout.current = setTimeout(async () => {
      try {
        const res = await authApi.checkEmail(email);
        setEmailAvailable(!res?.data?.exists);
      } catch (err) {
        setEmailAvailable(null);
      }
    }, 500);
  };

  const validatePassword = (pwd, confirm) => {
    // At least 8 chars, uppercase, lowercase, special char
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    const pwdOk = pwdRegex.test(pwd);
    setValidation((prev) => ({ ...prev, passwordValid: pwdOk, passwordsMatch: pwd === confirm }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final client validations
    if (!validation.emailSyntaxValid) return setMessage('Email không hợp lệ');
    if (emailAvailable === false) return setMessage('Email đã tồn tại');
    if (!validation.passwordValid) return setMessage('Mật khẩu chưa đáp ứng yêu cầu');
    if (!validation.passwordsMatch) return setMessage('Mật khẩu xác nhận không khớp');

    try {
      const payload = { username: form.username, email: form.email, password: form.password };
      const res = await authApi.register(payload);
      const successMsg = res?.data?.message || " Đăng ký thành công!";
      setMessage(successMsg);
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Register error:", err);
      const serverMsg = err?.response?.data?.message || err?.message || "Có lỗi xảy ra!";
      setMessage(` ${serverMsg}`);
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
            Tạo tài khoản mới
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Tên người dùng"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all bg-gray-50 placeholder-gray-500"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => {
                const email = e.target.value;
                setForm({ ...form, email });
                checkEmail(email);
              }}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all bg-gray-50 placeholder-gray-500"
            />
            {validation.emailSyntaxValid === false && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">❌ Email không hợp lệ</p>
            )}
            {emailAvailable === false && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">❌ Email đã tồn tại</p>
            )}
            {emailAvailable === true && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">✓ Email hợp lệ</p>
            )}
          </div>
          <div>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                validatePassword(e.target.value, form.confirmPassword);
              }}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all bg-gray-50 placeholder-gray-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm({ ...form, confirmPassword: e.target.value });
                validatePassword(form.password, e.target.value);
              }}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all bg-gray-50 placeholder-gray-500"
            />
          </div>

          <div className="text-sm bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-blue-900 mb-3">Yêu cầu mật khẩu:</p>
            <ul className="space-y-2">
              <li className={`flex items-center gap-2 ${validation.passwordValid ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                {validation.passwordValid ? '✓' : '○'} Ít nhất 8 ký tự
              </li>
              <li className={`flex items-center gap-2 ${validation.passwordValid ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                {validation.passwordValid ? '✓' : '○'} Chữ hoa và chữ thường
              </li>
              <li className={`flex items-center gap-2 ${validation.passwordValid ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                {validation.passwordValid ? '✓' : '○'} Ký tự đặc biệt (!@#)
              </li>
              <li className={`flex items-center gap-2 ${validation.passwordsMatch ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                {validation.passwordsMatch ? '✓' : '○'} Xác nhận khớp
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 mt-2"
          >
            Đăng ký
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
          Đã có tài khoản?{" "}
          <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}

export default Register;
