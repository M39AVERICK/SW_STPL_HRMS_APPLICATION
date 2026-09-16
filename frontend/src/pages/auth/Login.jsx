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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [time, setTime] = useState(new Date());

  const navigate = useNavigate();
  const carouselCards = [
  {
    title: "Oracle Fusion HRMS",
    description: "Enterprise Workforce & Resource Management",
    image:
      "https://images.unsplash.com/photo-1551434678-e076c223a692",
  },
  {
    title: "Employee Management",
    description: "Manage your workforce, departments and employee information.",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902",
  },
  {
    title: "Attendance Management",
    description: "Track employee attendance and workforce activity.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72",
  },
  {
    title: "Leave Management",
    description: "Manage employee leave requests and approval workflows.",
    image:
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
  },
  {
    title: "HR Analytics",
    description: "Monitor workforce information and business insights.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  },
];

  // 🕒 LIVE CLOCK
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    

    return () => clearInterval(interval);
  }, []);
  // 🔄 LOGIN CAROUSEL
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselCards.length);
  }, 2000);

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

// Show welcome notification after entering dashboard
sessionStorage.setItem("showWelcome", "true");

navigate("/dashboard");

    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 relative font-sans p-4">
      {/* LEFT CAROUSEL */}
<div className="hidden md:flex w-1/2 relative p-4">

  <div className="login-carousel">

    {/* Slides */}
    {carouselCards.map((card, index) => (
      <div
        key={index}
        className={`login-slide ${
          index === currentSlide
            ? "login-slide-active"
            : ""
        }`}
      >

        {/* Image */}
        <img
          src={card.image}
          className="login-slide-image"
          alt={card.title}
        />

        {/* Overlay */}
        <div className="login-slide-overlay"></div>

        {/* Content */}
        <div className="login-slide-content">

          {/* Badge */}
          <div className="login-carousel-badge">
            <span className="login-carousel-badge-dot"></span>

            STPL HRMS
          </div>

          {/* Title */}
          <h1 className="login-slide-title">
            {card.title}
          </h1>

          {/* Description */}
          <p className="login-slide-description">
            {card.description}
          </p>

        </div>

      </div>
    ))}


    
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