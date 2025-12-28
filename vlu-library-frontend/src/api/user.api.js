import axiosInstance from "./axiosConfig";

/**
 * User API
 * Các API liên quan đến quản lý thông tin người dùng
 */
const userAPI = {
  /**
   * Lấy thông tin profile của user hiện tại
   * @returns {Promise} Response data
   */
  getProfile: async () => {
    try {
      const response = await axiosInstance.get("/users/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật thông tin profile
   * @param {Object} data - Dữ liệu cần cập nhật
   * @param {string} data.name - Tên người dùng
   * @param {string} data.phoneNumber - Số điện thoại
   * @param {string} data.address - Địa chỉ (map với Khoa/Ngành)
   * @param {string} data.avatar - URL avatar
   * @returns {Promise} Response data
   */
  updateProfile: async (data) => {
    try {
      const response = await axiosInstance.put("/users/profile", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload ảnh đại diện
   * @param {FormData} formData - FormData chứa file ảnh với field name 'avatar'
   * @returns {Promise} Response data với avatarUrl mới
   */
  uploadAvatar: async (formData) => {
    try {
      const response = await axiosInstance.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Đổi mật khẩu
   * @param {Object} data - Dữ liệu đổi mật khẩu
   * @param {string} data.currentPassword - Mật khẩu hiện tại
   * @param {string} data.newPassword - Mật khẩu mới
   * @param {string} data.confirmPassword - Xác nhận mật khẩu mới
   * @returns {Promise} Response data
   */
  changePassword: async (data) => {
    try {
      const response = await axiosInstance.put("/users/change-password", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gửi yêu cầu nâng cấp lên Author
   * @param {Object} data - Dữ liệu yêu cầu
   * @param {string} data.reason - Lý do muốn trở thành Author
   * @returns {Promise} Response data
   */
  requestUpgrade: async (data) => {
    try {
      const response = await axiosInstance.post("/users/upgrade-request", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy trạng thái yêu cầu nâng cấp
   * @returns {Promise} Response data
   */
  getRequestStatus: async () => {
    try {
      const response = await axiosInstance.get("/users/upgrade-request/status");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Lấy danh sách toàn bộ người dùng
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @param {string} params.search - Tìm kiếm theo tên/email
   * @param {string} params.role - Lọc theo vai trò
   * @param {string} params.status - Lọc theo trạng thái
   * @returns {Promise} Response data
   */
  getAllUsers: async (params) => {
    try {
      const response = await axiosInstance.get("/admin/users", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Lấy danh sách yêu cầu nâng cấp Author
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter theo status (pending/approved/rejected)
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @returns {Promise} Response data
   */
  getUpgradeRequests: async (params) => {
    try {
      const response = await axiosInstance.get("/admin/upgrade-requests", {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Xét duyệt yêu cầu nâng cấp Author
   * @param {string} id - ID của upgrade request
   * @param {Object} data - Dữ liệu xét duyệt
   * @param {string} data.status - Trạng thái (approved/rejected)
   * @param {string} data.rejectionReason - Lý do từ chối (nếu reject)
   * @returns {Promise} Response data
   */
  reviewUpgradeRequest: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        `/admin/upgrade-requests/${id}/review`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Thay đổi vai trò người dùng
   * @param {string} userId - ID của người dùng
   * @param {string} newRole - Vai trò mới (User/Author/Moderator/Admin)
   * @returns {Promise} Response data
   */
  updateUserRole: async (userId, newRole) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${userId}/role`, {
        newRole,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Thay đổi vai trò người dùng (Alias for backward compatibility)
   * @deprecated Use updateUserRole instead
   */
  changeUserRole: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/admin/users/${id}/role`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Khóa/Mở khóa tài khoản
   * @param {string} id - ID của người dùng
   * @param {Object} data - Dữ liệu thay đổi
   * @param {string} data.status - Trạng thái (active/locked)
   * @param {string} data.reason - Lý do khóa (nếu lock)
   * @returns {Promise} Response data
   */
  changeUserStatus: async (id, data) => {
    try {
      const response = await axiosInstance.put(
        `/admin/users/${id}/status`,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * [ADMIN] Khóa/Mở khóa tài khoản
   * @param {string} userId - ID của người dùng
   * @param {string} action - Hành động ('lock' hoặc 'unlock')
   * @param {string} reason - Lý do khóa (bắt buộc nếu action='lock')
   * @returns {Promise} Response data
   */
  lockUser: async (userId, action, reason = "") => {
    try {
      // Convert action to status for backend compatibility
      const status = action === "lock" ? "locked" : "active";
      const payload = { status };

      if (action === "lock") {
        payload.reason = reason;
      }

      const response = await axiosInstance.put(
        `/admin/users/${userId}/status`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default userAPI;
