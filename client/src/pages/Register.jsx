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
    <div className="min-h-screen flex items-center justify-center bg-instagram-light">
      <div className="w-full max-w-sm bg-white border border-instagram-border rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-instagram-text">
           Postly
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
            onChange={(e) => {
              const email = e.target.value;
              setForm({ ...form, email });
              checkEmail(email);
            }}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />
          {validation.emailSyntaxValid === false && (
            <p className="text-sm text-red-600 mt-1">Email không hợp lệ</p>
          )}
          {emailAvailable === false && (
            <p className="text-sm text-red-600 mt-1">Email đã tồn tại</p>
          )}
          {emailAvailable === true && (
            <p className="text-sm text-green-600 mt-1">Email hợp lệ và có thể sử dụng</p>
          )}
          <input
            type="password"
            placeholder="Mật khẩu"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              validatePassword(e.target.value, form.confirmPassword);
            }}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />
          {form.password && !validation.passwordValid && (
            <p className="text-sm text-red-600 mt-1">Mật khẩu chưa đáp ứng yêu cầu</p>
          )}
          {form.password && validation.passwordValid && (
            <p className="text-sm text-green-600 mt-1">Mật khẩu hợp lệ</p>
          )}
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={form.confirmPassword}
            onChange={(e) => {
              setForm({ ...form, confirmPassword: e.target.value });
              validatePassword(form.password, e.target.value);
            }}
            required
            className="px-3 py-2 border border-instagram-border rounded-lg outline-none focus:border-instagram-primary focus:ring-1 focus:ring-instagram-primary text-sm transition-all"
          />

          <div className="text-sm text-instagram-textSecondary">
            <ul className="list-disc ml-5">
              <li className={`${validation.passwordValid ? 'text-green-600' : 'text-red-600'}`}>Ít nhất 8 ký tự</li>
              <li className={`${validation.passwordValid ? 'text-green-600' : 'text-red-600'}`}>Có chữ hoa và chữ thường</li>
              <li className={`${validation.passwordValid ? 'text-green-600' : 'text-red-600'}`}>Có ký tự đặc biệt (ví dụ: !@#)</li>
              <li className={`${validation.passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>Mật khẩu xác nhận khớp</li>
            </ul>
          </div>

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
