import axios from "axios";

/**
 * Axios Instance Configuration
 *
 * Cấu hình axios instance với baseURL và cấu trúc sẵn sàng cho interceptors
 */
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Tự động thêm access token vào header của mỗi request (nếu có)
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Lấy access token từ local storage
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Xử lý response và error một cách tập trung
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp thay vì response object
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Xử lý token hết hạn (401) - sẽ implement refresh token logic sau
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // TODO: Implement refresh token logic
      // const refreshToken = localStorage.getItem("refreshToken");
      // if (refreshToken) {
      //   try {
      //     const response = await axios.post("/auth/refresh", { refreshToken });
      //     localStorage.setItem("accessToken", response.data.accessToken);
      //     return axiosInstance(originalRequest);
      //   } catch (refreshError) {
      //     localStorage.clear();
      //     window.location.href = "/login";
      //   }
      // }
    }

    // Xử lý các lỗi khác
    return Promise.reject(error);
  },
);

export default axiosInstance;
