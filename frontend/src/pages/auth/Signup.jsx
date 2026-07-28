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

    if (form.password !== form.password2) {
      alert("Passwords do not match!");
      return;
    }

    if (!form.TC) {
      alert("You must accept the Terms and Conditions");
      return;
    }

    try {
      await API.post("users/register/", form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Signup failed! Check all fields and try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-100 to-pink-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create an Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <input
            type="password"
            name="password2"
            placeholder="Confirm Password"
            value={form.password2}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              name="TC"
              checked={form.TC}
              onChange={handleChange}
              className="mr-2"
              required
            />
            <label className="text-sm text-gray-600">
              I accept the{" "}
              <span className="text-purple-500 hover:underline cursor-pointer">
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-purple-500 hover:underline cursor-pointer"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;