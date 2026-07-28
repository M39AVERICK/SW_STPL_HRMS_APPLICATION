import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api";

function ResetPassword() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    password1: "",
    password2: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post(`users/reset-password/${uid}/${token}/`, form);

      alert("Password reset successful!");
      navigate("/login");  // 🔥 redirect

    } catch (err) {
      console.error(err);
      alert("Invalid or expired link");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 to-purple-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        
        <h2 className="text-2xl font-bold text-center mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            name="password1"
            placeholder="New Password"
            value={form.password1}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="password"
            name="password2"
            placeholder="Confirm Password"
            value={form.password2}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600"
          >
            Reset Password
          </button>
        </form>

      </div>
    </div>
  );
}

export default ResetPassword;