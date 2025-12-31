import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as authAPI from "../api/auth.api";

/**
 * Authentication Context
 * FIXED: Bỏ setLoading trong hàm login để tránh re-render gây mất state lỗi
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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
   * FIXED: KHÔNG setLoading ở đây - để component tự quản lý loading state
   * Điều này tránh re-render gây mất apiError state
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response?.status === "success" && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        const redirectPath =
          localStorage.getItem("redirectPath") || "/documents";
        localStorage.removeItem("redirectPath");
        navigate(redirectPath, { replace: true });

        return true;
      } else {
        throw new Error("Sai email hoặc mật khẩu");
      }
    } catch (error) {
      // FIXED: Xử lý error message rõ ràng
      let errorMessage = "Sai email hoặc mật khẩu";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message && error.message !== "Network Error") {
        errorMessage = error.message;
      } else if (error?.message === "Network Error") {
        errorMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }

      // Throw error để LoginPage có thể catch và hiển thị
      throw new Error(errorMessage);
    }
  };

  /**
   * Hàm đăng nhập Microsoft
   */
  const loginWithMicrosoft = async (microsoftAccessToken) => {
    try {
      const response = await authAPI.loginWithMicrosoft(microsoftAccessToken);

      if (response?.status === "success" && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userData));

        setUser(userData);
        setIsAuthenticated(true);

        if (userData.role === "Admin") {
          navigate("/admin/dashboard", { replace: true });
        } else if (userData.role === "Moderator") {
          navigate("/moderator/dashboard", { replace: true });
        } else {
          navigate("/documents", { replace: true });
        }

        return userData;
      } else {
        throw new Error("Đăng nhập Microsoft thất bại");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập Microsoft thất bại. Vui lòng thử lại.";

      throw new Error(errorMessage);
    }
  };

  /**
   * Hàm đăng ký
   */
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response?.status === "success") {
        await login(userData.email, userData.password);
        return true;
      } else {
        throw new Error("Đăng ký thất bại");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng ký thất bại. Vui lòng thử lại";
      throw new Error(errorMessage);
    }
  };

  /**
   * Hàm đăng xuất
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      setUser(null);
      setIsAuthenticated(false);

      navigate("/login", { replace: true });
    }
  };

  /**
   * Hàm refresh token
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

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Refresh token error:", error);
      logout();
      return false;
    }
  };

  /**
   * Cập nhật avatar
   */
  const updateUserAvatar = (newAvatarUrl) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      avatarUrl: newAvatarUrl,
    };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  /**
   * Cập nhật thông tin user
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export default AuthContext;
