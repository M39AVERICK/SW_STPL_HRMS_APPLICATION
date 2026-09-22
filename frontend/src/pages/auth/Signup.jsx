import { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    date_of_birth: "",
    password: "",
    password2: "",
    TC: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      setError("Passwords do not match!");
      return;
    }

    if (!form.TC) {
      setError("You must accept the Terms and Conditions to proceed.");
      return;
    }

    setLoading(true);

    try {
      await API.post("users/register/", form);
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Registration failed. Please check your information and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[640px] border border-slate-200/60 relative">
        
        {/* LEFT SIDE - HERO BRANDING */}
        <div className="hidden md:flex w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-10 text-white">
          {/* Background Image with Overlay */}
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop"
            alt="STPL Enterprise Onboarding"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

          {/* Top Enterprise Tag */}
          <div className="relative z-10 flex items-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              STPL HRMS Onboarding
            </span>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 space-y-3 mt-auto">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
              Join the Enterprise Network
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Create your corporate portal account to access employee self-service tools, workflows, and HR resources.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - SIGNUP FORM */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 flex flex-col justify-center bg-white relative z-10">
          <div className="max-w-md w-full mx-auto space-y-5">
            
            {/* Header / Logo */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-blue-500/30">
                  S
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 leading-none">STPL</h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Oracle HRMS Cloud</p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                <p className="text-xs text-slate-500 mt-1">Fill in your enterprise details below</p>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-3.5">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/80 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Corporate Email */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Corporate Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/80 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={form.date_of_birth}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600/80 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold focus:outline-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/80 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-700">Confirm Password</label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold focus:outline-none"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="password2"
                  placeholder="••••••••"
                  value={form.password2}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/80 focus:bg-white transition-all duration-200"
                />
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center pt-1">
                <input
                  type="checkbox"
                  id="TC"
                  name="TC"
                  checked={form.TC}
                  onChange={handleChange}
                  required
                  className="h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="TC" className="ml-2 text-xs text-slate-600 cursor-pointer">
                  I accept the{" "}
                  <span className="text-blue-600 hover:underline font-semibold">
                    Terms and Conditions
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Footer Navigation */}
            <div className="pt-2 text-center text-xs font-medium border-t border-slate-100">
              <span className="text-slate-500">Already have an enterprise account? </span>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors ml-1"
              >
                Sign In
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Signup;