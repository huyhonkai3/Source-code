import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authAPI from "../api/auth.api";

/**
 * Authentication Context
 * Quản lý global state cho authentication
 */
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Wrap ứng dụng để cung cấp authentication state và functions
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  /**
   * Check authentication khi app khởi động
   * Kiểm tra xem có token trong localStorage không
   */
  useEffect(() => {
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (accessToken && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        // Nếu có lỗi, clear localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  /**
   * Hàm đăng nhập thông thường
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Promise<boolean>} - True nếu đăng nhập thành công
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      // Gọi API login
      const response = await authAPI.login({ email, password });

      // Kiểm tra kết quả response
      if (response?.status === "success" && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Lưu token vào localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Cập nhật state
        setUser(userData);
        setIsAuthenticated(true);

        // Chuyển hướng về trang chủ
        const redirectPath = "/documents";
        localStorage.removeItem("redirectPath");
        navigate(redirectPath, { replace: true });

        return true;
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Login error:", error);
      // Xử lý error message từ backend
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm xử lý đăng nhập Microsoft
   * @param {string} microsoftAccessToken - Access token từ MSAL
   * @returns {Promise<object>} - User object
   */
  const loginWithMicrosoft = async (microsoftAccessToken) => {
    setLoading(true);
    try {
      // Gọi API loginWithMicrosoft từ auth.api.js
      const response = await authAPI.loginWithMicrosoft(microsoftAccessToken);

      // Kiểm tra response format đúng
      // Backend trả về: { status: "success", data: { user, accessToken, refreshToken } }
      if (response?.status === "success" && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        // Lưu tokens vào localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Cập nhật state
        setUser(userData);
        setIsAuthenticated(true);

        // Chuyển hướng dựa trên role
        if (userData.role === "Admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userData.role === "Moderator") {
          navigate("/moderator/dashboard", { replace: true });
        } else {
          navigate("/documents", { replace: true });
        }

        return userData;
      } else {
        throw new Error("Invalid response structure from server");
      }
    } catch (error) {
      console.error("Microsoft Login error:", error);

      // Xử lý error message từ backend
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng nhập Microsoft thất bại. Vui lòng thử lại.";

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm đăng ký
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise<boolean>}
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      if (response?.status === "success") {
        // Sau khi đăng ký thành công, tự động đăng nhập
        await login(userData.email, userData.password);
        return true;
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng ký thất bại. Vui lòng thử lại";
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hàm đăng xuất
   * Clear tất cả dữ liệu authentication
   */
  const logout = async () => {
    try {
      // Gọi API logout
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Reset state
      setUser(null);
      setIsAuthenticated(false);

      // Chuyển về trang login
      navigate("/login", { replace: true });
    }
  };

  /**
   * Hàm refresh access token
   * @returns {Promise<boolean>}
   */
  const refreshToken = async () => {
    try {
      const currentRefreshToken = localStorage.getItem("refreshToken");
      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authAPI.refreshAccessToken(currentRefreshToken);
      if (response.status === "success" && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Cập nhật token
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      // Nếu refresh token thất bại, đăng xuất
      logout();
      return false;
    }
  };

  /**
   * Hàm cập nhật avatar trong context
   * Dùng sau khi upload avatar thành công
   * @param {string} newAvatarUrl - URL avatar mới
   */
  const updateUserAvatar = (newAvatarUrl) => {
    if (!user) return;

    // Cập nhật state user với avatar mới
    const updatedUser = {
      ...user,
      avatarUrl: newAvatarUrl,
    };

    setUser(updatedUser);

    // Cập nhật localStorage để persist
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  /**
   * Hàm cập nhật thông tin user trong context
   * Dùng khi cần cập nhật các field khác của user
   * @param {Object} updates - Object chứa các field cần cập nhật
   */
  const updateUser = (updates) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...updates,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    loginWithMicrosoft,
    register,
    logout,
    refreshToken,
    updateUserAvatar,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook để sử dụng AuthContext
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
