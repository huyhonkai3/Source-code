import axiosInstance from "./axiosConfig";

/**
 * Dashboard API Service
 * API endpoints for admin dashboard statistics
 */

/**
 * Get dashboard statistics
 * @param {Object} params - Query parameters
 * @param {string} params.period - Time period filter (all, week, month, year)
 * @returns {Promise} Response data with overview, topViewed, topDownloaded, etc.
 */
export const getStats = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/documents/stats", {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get system health status (mock for MVP)
 * @returns {Promise} System status data
 */
export const getSystemStatus = async () => {
  try {
    // TODO: Replace with actual endpoint when backend is ready
    // const response = await axiosInstance.get('/admin/system/status');
    // return response.data;

    // Mock data for MVP
    return {
      status: "success",
      data: {
        serverStatus: "online",
        databaseStatus: "stable",
        uptime: "15 days",
        lastBackup: new Date().toISOString(),
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending upgrade requests for dashboard
 * Gọi API thật từ backend để lấy danh sách yêu cầu nâng cấp
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Số lượng yêu cầu cần lấy (default: 5)
 * @returns {Promise} Upgrade requests data
 */
export const getUpgradeRequests = async (params = {}) => {
  try {
    // Gọi API thật từ backend
    const response = await axiosInstance.get("/admin/upgrade-requests", {
      params: {
        status: "pending", // Chỉ lấy các yêu cầu đang chờ duyệt
        limit: params.limit || 5, // Giới hạn số lượng cho dashboard
        page: 1,
      },
    });

    // Transform data để phù hợp với format của DashboardPage
    if (response.data.status === "success") {
      const { requests, pagination } = response.data.data;

      // Map data từ backend sang format dashboard cần
      const recentRequests = requests.map((req) => ({
        id: req.id || req._id,
        userName: req.userId?.name || "Unknown",
        email: req.userId?.email || "",
        avatarUrl: req.userId?.avatarUrl || "",
        reason: req.reason || "",
        requestedAt: req.createdAt,
      }));

      return {
        status: "success",
        data: {
          pending: pagination.totalRequests || 0,
          recent: recentRequests,
        },
      };
    }

    return response.data;
  } catch (error) {
    console.error("Get upgrade requests error:", error);
    // Trả về empty data nếu có lỗi (không crash dashboard)
    return {
      status: "success",
      data: {
        pending: 0,
        recent: [],
      },
    };
  }
};

// Export as default object
const dashboardAPI = {
  getStats,
  getSystemStatus,
  getUpgradeRequests,
};

export default dashboardAPI;
