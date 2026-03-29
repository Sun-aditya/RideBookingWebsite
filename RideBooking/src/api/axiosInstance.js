import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ridebooking_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${String(config.method || "GET").toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("ridebooking_token");
      localStorage.removeItem("ridebooking_user");
      localStorage.removeItem("ridebooking_role");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (error?.response) {
      throw error.response.data;
    }

    if (error?.request) {
      throw { message: "No response from server. Check your connection." };
    }

    throw { message: error.message || "Unknown request error" };
  }
);

export default axiosInstance;
