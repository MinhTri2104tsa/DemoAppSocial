const axios = rewuire("axios");

const axiosClient = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Interceptor: tự động thêm token vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Không set Content-Type nếu là FormData - let browser set it
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  
  return config;
});

module.exports = axiosClient;