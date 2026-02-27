import axiosInstance from "./axiosConfig";

/**
 * Notifications API Service
 * Các hàm gọi API thông báo
 */

/**
 * Lấy danh sách thông báo của user đang đăng nhập
 * @param {Object} params - { page, limit }
 */
export const getNotifications = async (params = {}) => {
  const response = await axiosInstance.get("/notifications", { params });
  return response.data;
};

/**
 * Đếm số thông báo chưa đọc
 * @returns {Promise<number>} - Số lượng thông báo chưa đọc
 */
export const getUnreadCount = async () => {
  const response = await axiosInstance.get("/notifications/unread-count");
  return response.data?.data?.count || 0;
};

/**
 * Đánh dấu 1 thông báo là đã đọc
 * @param {string} id - Notification ID
 */
export const markAsRead = async (id) => {
  const response = await axiosInstance.put(`/notifications/${id}/read`);
  return response.data;
};

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export const markAllAsRead = async () => {
  const response = await axiosInstance.put("/notifications/read-all");
  return response.data;
};
