import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000/api/";

// =========================
// 🔥 SINGLE AXIOS INSTANCE
// =========================
const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // for refresh token cookie
});

// =========================
// 🔐 REQUEST INTERCEPTOR
// Attach token to every request
// =========================
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================
// 🔥 RESPONSE INTERCEPTOR (AUTO REFRESH)
// Handles expired access token
// =========================
API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      return Promise.reject(error);
    }

    // =========================
    // 401 - TOKEN EXPIRED
    // =========================
    if (
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // refresh token call (accounts app)
        const res = await axios.post(
          `${BASE_URL}users/refresh/`,
          {},
          { withCredentials: true }
        );

        const newAccess = res.data.access;

        if (!newAccess) {
          throw new Error("No access token returned");
        }

        // update storage
        localStorage.setItem("accessToken", newAccess);

        // update failed request
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return API(originalRequest);
      } catch (err) {
        // =========================
        // HARD LOGOUT (SECURE)
        // =========================
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;