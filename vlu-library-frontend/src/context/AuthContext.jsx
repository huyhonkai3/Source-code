import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../api/auth.api";

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
   * Hàm đăng nhập
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
        // localStorage.getItem("redirectPath") || "/documents";
        localStorage.removeItem("redirectPath");
        navigate(redirectPath, { replace: true });
        return true;
      } else {
        throw new Error("Invalid response structured");
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
   * Hàm đăng ký
   * @param {Object} userData - Thông tin đăng ký
   * @returns {Promise<boolean>}
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authAPI.register(userData);
      if (response?.status === "success") {
        // Sau khi đăng ký thành công, tự động đăng nhập => sẽ implement chức năng gửi email xác thực sau
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
      // Clear localstorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Reset state
      setUser(null);
      setIsAuthenticated(false);

      // chuyển về trang login
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

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshToken,
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
