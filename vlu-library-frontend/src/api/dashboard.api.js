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
 * Get pending upgrade requests (mock for MVP)
 * @returns {Promise} Upgrade requests data
 */
export const getUpgradeRequests = async () => {
  try {
    // TODO: Replace with actual endpoint when backend is ready
    // const response = await axiosInstance.get('/admin/upgrade-requests');
    // return response.data;

    // Mock data for MVP
    return {
      status: "success",
      data: {
        pending: 3,
        recent: [
          {
            id: "1",
            userName: "Nguyễn Văn A",
            email: "sv.nguyenvana@vanlanguni.vn",
            requestedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
          },
          {
            id: "2",
            userName: "Trần Thị B",
            email: "sv.tranthib@vanlanguni.vn",
            requestedAt: new Date(
              Date.now() - 2 * 60 * 60 * 1000,
            ).toISOString(), // 2 hours ago
          },
        ],
      },
    };
  } catch (error) {
    throw error;
  }
};

// Export as default object
const dashboardAPI = {
  getStats,
  getSystemStatus,
  getUpgradeRequests,
};

export default dashboardAPI;
