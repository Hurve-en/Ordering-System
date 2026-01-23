import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks/useRedux";
import {
  loginSuccess,
  loginFailure,
  setLoading,
} from "../redux/slices/authSlice";
import axios from "axios";

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoadingState] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        formData,
      );
      dispatch(
        loginSuccess({
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken,
        }),
      );
      navigate("/admin/dashboard");
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      dispatch(loginFailure(errorMsg));
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-coffee-900 to-coffee-800 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-4">👨‍💼</div>
          <h1 className="text-3xl font-bold text-coffee-900">Admin Portal</h1>
          <p className="mt-2 text-gray-600">Mt. Apo's Best Coffee</p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              placeholder="admin@coffeehub.com"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-coffee-900 hover:bg-coffee-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500 disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Admin Login"}
          </button>
        </form>

        {/* Back to Customer */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Not an admin?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-medium text-coffee-900 hover:text-coffee-800"
            >
              Customer login
            </button>
          </p>
        </div>

        {/* Test Credentials */}
        <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-800 font-medium">
            Test Admin Account:
          </p>
          <p className="text-sm text-blue-800">
            Email: customer1@coffeeorder.com
          </p>
          <p className="text-sm text-blue-800">Password: password123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
