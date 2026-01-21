import axios from "axios";

/**
 * Axios Instance Configuration
 * - Tự động refresh token khi access token hết hạn (401)
 * - Queue mechanism để xử lý multiple requests cùng lúc
 * - Auto logout khi refresh token cũng hết hạn
 */

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Tăng lên 30 seconds để tránh timeout khi upload
  headers: {
    "Content-Type": "application/json",
  },
});

// ========================================
// BIẾN QUẢN LÝ REFRESH TOKEN
// ========================================

/**
 * Flag đánh dấu đang trong quá trình refresh token
 * Tránh gọi refresh API nhiều lần cùng lúc
 */
let isRefreshing = false;

/**
 * Queue chứa các requests đang chờ refresh token hoàn thành
 * Khi refresh xong, tất cả requests trong queue sẽ được retry
 */
let failedQueue = [];

/**
 * Xử lý queue sau khi refresh token hoàn thành
 * @param {Error|null} error - Lỗi nếu refresh thất bại
 * @param {string|null} token - Access token mới nếu refresh thành công
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Xử lý logout - clear storage và redirect
 */
const handleLogout = () => {
  console.log("[AxiosConfig] Session expired, logging out...");

  // Clear tất cả auth data
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Redirect to login nếu chưa ở trang login
  if (
    !window.location.pathname.includes("/login") &&
    !window.location.pathname.includes("/register")
  ) {
    // Lưu current path để redirect sau khi login
    localStorage.setItem("redirectPath", window.location.pathname);
    window.location.href = "/login";
  }
};

// ========================================
// REQUEST INTERCEPTOR
// ========================================

/**
 * Tự động thêm access token vào header của mỗi request
 */
axiosInstance.interceptors.request.use(
  (config) => {
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

// ========================================
// RESPONSE INTERCEPTOR - AUTO REFRESH TOKEN
// ========================================

axiosInstance.interceptors.response.use(
  // Success handler - trả về response bình thường
  (response) => {
    return response;
  },

  // Error handler - xử lý 401 và auto refresh
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra có phải lỗi 401 (Unauthorized) không
    // Và request này chưa được retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh token, thêm request vào queue chờ
      if (isRefreshing) {
        console.log("[AxiosConfig] Already refreshing, queuing request...");

        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Sau khi có token mới, retry request với token mới
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Đánh dấu request này đã retry (tránh infinite loop)
      originalRequest._retry = true;
      isRefreshing = true;

      console.log("[AxiosConfig] Access token expired, attempting refresh...");

      const refreshToken = localStorage.getItem("refreshToken");

      // Không có refresh token -> logout ngay
      if (!refreshToken) {
        console.log("[AxiosConfig] No refresh token found, logging out...");
        isRefreshing = false;
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh token
        // QUAN TRỌNG: Dùng axios.post thay vì axiosInstance.post
        // để tránh interceptor loop
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // Kiểm tra response thành công
        if (response.data?.status === "success" && response.data?.data) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data.data;

          console.log("[AxiosConfig] Token refreshed successfully!");

          // Lưu tokens mới vào localStorage
          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          // Cập nhật header Authorization cho request gốc
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Xử lý tất cả requests đang chờ trong queue
          processQueue(null, newAccessToken);

          // Retry request gốc với token mới
          return axiosInstance(originalRequest);
        } else {
          // Response không đúng format mong đợi
          throw new Error("Invalid refresh token response");
        }
      } catch (refreshError) {
        console.error("[AxiosConfig] Refresh token failed:", refreshError);

        // Thông báo lỗi cho tất cả requests trong queue
        processQueue(refreshError, null);

        // Logout user
        handleLogout();

        return Promise.reject(refreshError);
      } finally {
        // Reset flag sau khi hoàn thành (dù thành công hay thất bại)
        isRefreshing = false;
      }
    }

    // Các lỗi khác (không phải 401) - reject bình thường
    return Promise.reject(error);
  },
);

export default axiosInstance;
