import axiosInstance from "./axiosConfig";

/**
 * Authentication API Service
 *
 * Các hàm gọi API liên quan đến authentication
 */

/**
 * Đăng nhập
 * @param {Object} credentials - Thông tin đăng nhập
 * @param {string} credentials.email - Email người dùng
 * @param {string} credentials.password - Mật khẩu
 * @returns {Promise} Response data từ server
 */
export const login = async (credentials) => {
  try {
    const response = await axiosInstance.post("auth/login", credentials);
    return response.data;
  } catch (error) {
    // Ném lỗi để AuthContext xử lý]\
    throw error;
  }
};

/**
 * Đăng nhập bằng Microsoft (Tính năng mới)
 * @param {string} microsoftAccessToken - Access token nhận được từ MSAL
 * @returns {Promise} Response data từ server (bao gồm user, accessToken, refreshToken)
 */
export const loginWithMicrosoft = async (microsoftAccessToken) => {
  try {
    // Gửi token của Microsoft xuống backend để xác thực
    const response = await axiosInstance.post("/auth/microsoft-login", {
      accessToken: microsoftAccessToken,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Đăng ký tài khoản
 * @param {Object} userData - Thông tin đăng ký
 * @param {string} userData.name - Tên người dùng
 * @param {string} userData.email - Email
 * @param {string} userData.password - Mật khẩu
 * @param {string} userData.confirmPassword - Xác nhận mật khẩu
 * @returns {Promise} Response data từ server
 */
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Làm mới access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} Response data với access token mới
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axiosInstance.post("/auth/refresh", {
      refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Đăng xuất (sẽ implement khi backend có endpoint)
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    // Gọi API logout
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Đổi mật khẩu
 * @param {Object} data - Thông tin đổi mật khẩu
 * @param {string} data.currentPassword - Mật khẩu hiện tại
 * @param {string} data.newPassword - Mật khẩu mới
 * @returns {Promise} Response data từ server
 */
export const changePassword = async (data) => {
  try {
    const response = await axiosInstance.put("/auth/change-password", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const authAPI = {
  login,
  loginWithMicrosoft,
  register,
  refreshAccessToken,
  logout,
  changePassword,
};

export default authAPI;
