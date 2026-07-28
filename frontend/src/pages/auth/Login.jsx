import { useState, useEffect, useContext } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();

  // 🕒 LIVE CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✨ MORE REALISTIC ENTERPRISE TEXT
  const fullText = "Oracle Fusion HRMS • Secure Workforce Management System";

  useEffect(() => {
    let i = 0;

    const type = () => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
        setTimeout(type, 70);
      }
    };

    type();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("users/login/", form);

      const { access, user } = res.data;

      if (!user?.is_active) {
        setError("Account is disabled");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", access);
      localStorage.setItem("user", JSON.stringify(user));

      login(access, user);

      navigate("/dashboard");

    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 relative font-sans">

      {/* LEFT IMAGE */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1551434678-e076c223a692"
          className="w-full h-full object-cover"
          alt="enterprise"
        />
        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-3">
              Oracle Fusion HRMS
            </h1>
            <p className="text-gray-300 text-sm">
              Enterprise Workforce & Resource Management
            </p>
          </div>
        </div>
      </div>

      {/* LOGIN FORM */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-4">

        <div className="relative bg-white/70 backdrop-blur-xl border p-10 rounded-3xl shadow-2xl w-full max-w-md">

          {/* 🕒 LIVE CLOCK */}
          <div className="absolute top-4 right-5 text-xs text-gray-600 font-medium">
            {time.toLocaleTimeString()}
          </div>

          {/* LOGO */}
          <div className="flex justify-center mb-6 gap-2">
            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold">
              S
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">STPL</h1>
              <p className="text-xs text-gray-500">Oracle HRMS Cloud</p>
            </div>
          </div>

          {/* ✨ ANIMATED TEXT */}
          <div className="text-center mb-4 text-xs text-gray-600 font-medium">
            {text}
            <span className="animate-pulse">|</span>
          </div>

          <h2 className="text-xl text-center mb-6">
            Secure Sign-In
          </h2>

          {error && (
            <div className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            <input
              type="email"
              name="email"
              placeholder="Corporate Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
              />

              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-xs cursor-pointer text-blue-600 hover:underline"
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>

            {/* 🔥 INTERACTIVE BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded transition-all duration-300 hover:scale-[1.03] hover:bg-blue-700 hover:shadow-lg active:scale-95"
            >
              {loading ? "Authenticating..." : "Secure Login"}
            </button>
          </form>

          {/* LINKS */}
          <div className="mt-6 text-center text-sm space-y-2">

            <p
              onClick={() => navigate("/signup")}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Create Account
            </p>

            <p
              onClick={() => navigate("/forgot-password")}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Recover Password
            </p>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;