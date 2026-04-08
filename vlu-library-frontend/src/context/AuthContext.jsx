import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import * as authAPI from "../api/auth.api";
import userAPI from "../api/user.api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // State quota tách riêng để update không trigger re-render toàn bộ user object
  const [downloadAllowance, setDownloadAllowance] = useState(0);
  const [uploadCycleCount, setUploadCycleCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        // Gọi API lấy user mới nhất — đồng bộ downloadAllowance, uploadCycleCount
        const response = await userAPI.getProfile(); // GET /api/auth/me
        if (response?.status === "success" && response.data?.user) {
          const freshUser = response.data.user;
          setUser(freshUser);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(freshUser)); // cập nhật cache
        } else {
          // Token hết hạn hoặc invalid
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
        }
      } catch (error) {
        // Token invalid → clear
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
   * Helper: Lưu user vào state và localStorage
   * Đảm bảo quota fields luôn được sync
   */
  const _persistUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setDownloadAllowance(userData.downloadAllowance ?? 0);
    setUploadCycleCount(userData.uploadCycleCount ?? 0);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /**
   * Hàm đăng nhập
   */
  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });

      if (response?.status === "success" && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Dùng _persistUser thay vì setUser trực tiếp
        _persistUser(userData);

        const redirectPath =
          localStorage.getItem("redirectPath") || "/documents";
        localStorage.removeItem("redirectPath");
        navigate(redirectPath, { replace: true });

        return true;
      } else {
        throw new Error("Sai email hoặc mật khẩu");
      }
    } catch (error) {
      let errorMessage = "Sai email hoặc mật khẩu";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message && error.message !== "Network Error") {
        errorMessage = error.message;
      } else if (error?.message === "Network Error") {
        errorMessage =
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
      }

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

        // Dùng _persistUser
        _persistUser(userData);

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

      // [MỚI] Reset quota state khi logout
      setDownloadAllowance(0);
      setUploadCycleCount(0);

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

  // updateQuota: Cập nhật quota state từ bên ngoài
  /**
   * Cập nhật quota state sau khi download thành công / bị từ chối.
   * Được gọi từ useDownload hook.
   *
   * @param {number} allowance - Số lượt tải còn lại mới
   * @param {number} cycle     - Số tài liệu đã upload trong vòng hiện tại
   */
  const updateQuota = useCallback((allowance, cycle) => {
    setDownloadAllowance(allowance);
    setUploadCycleCount(cycle);

    // Sync vào localStorage để reload trang không mất state
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.downloadAllowance = allowance;
        userData.uploadCycleCount = cycle;
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (e) {
      console.error("[AuthContext] Failed to sync quota to localStorage:", e);
    }
  }, []);

  const updateUserAvatar = (newAvatarUrl) => {
    if (!user) return;
    const updatedUser = { ...user, avatarUrl: newAvatarUrl };
    _persistUser(updatedUser);
  };

  const updateUser = (updates) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    _persistUser(updatedUser);
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
    // Quota state và updater
    downloadAllowance,
    uploadCycleCount,
    updateQuota,
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
