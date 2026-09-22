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
      description: "Enterprise Workforce & Resource Management System",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Employee Management",
      description: "Manage your workforce, departments, and organizational structures effortlessly.",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Attendance Management",
      description: "Track real-time employee attendance and workforce activity.",
      image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Leave Workflows",
      description: "Streamline employee leave requests and approval processing.",
      image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "HR Analytics",
      description: "Monitor critical workforce metrics and strategic business insights.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  // 🕒 Live Clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔄 Login Carousel Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselCards.length);
    }, 4000); // 4 seconds per slide for better readability
    return () => clearInterval(interval);
  }, [carouselCards.length]);

  // ✨ Typing Text Effect
  const fullText = "Oracle Fusion HRMS • Enterprise Portal";
  useEffect(() => {
    let i = 0;
    const type = () => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
        setTimeout(type, 60);
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
        setError("Account is disabled. Please contact your administrator.");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", access);
      localStorage.setItem("user", JSON.stringify(user));

      login(access, user);
      sessionStorage.setItem("showWelcome", "true");
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid corporate credentials. Please try again.");
    } font-sans 
      setLoading(false);
    
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[620px] border border-slate-200/60 relative">
        
        {/* 🕒 Live Clock Badge (Top Right Desktop) */}
        <div className="absolute top-5 right-6 z-20 hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 backdrop-blur-md rounded-full border border-slate-200/80 text-xs text-slate-600 font-mono font-medium shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {time.toLocaleTimeString()}
        </div>

        {/* LEFT SIDE CAROUSEL */}
        <div className="hidden md:flex w-1/2 relative bg-slate-900 overflow-hidden">
          {carouselCards.map((card, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex flex-col justify-between p-10 ${
                index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Image with Dark Gradient Overlay */}
              <img
                src={card.image}
                alt={card.title}
                className="absolute inset-0 w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

              {/* Top Enterprise Tag */}
              <div className="relative z-10 flex items-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  STPL HRMS
                </span>
              </div>

              {/* Bottom Content & Indicator Dots */}
              <div className="relative z-10 space-y-4">
                <div className="space-y-2">
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                    {card.title}
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                    {card.description}
                  </p>
                </div>

                {/* Carousel Indicators */}
                <div className="flex gap-2 pt-2">
                  {carouselCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentSlide ? "w-6 bg-blue-500" : "w-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white relative z-10">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header / Logo */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/30">
                  S
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-none">STPL</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Oracle HRMS Cloud</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Secure Sign-In</h2>
                {/* Animated Typing Text */}
                <p className="text-xs text-slate-500 font-mono mt-1 min-h-[18px]">
                  {text}
                  <span className="animate-pulse text-blue-600 font-bold">|</span>
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Corporate Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/80 focus:bg-white focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold focus:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/80 focus:bg-white focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  "Secure Login"
                )}
              </button>
            </form>

            {/* Links */}
            <div className="pt-2 flex items-center justify-between text-xs font-medium border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                Recover Password
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;