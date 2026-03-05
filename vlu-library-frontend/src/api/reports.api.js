import axiosInstance from "./axiosConfig";

/**
 * Reports API Service - Notice & Takedown System
 * Kết nối đến /api/reports
 */

/**
 * Người dùng gửi báo cáo vi phạm tài liệu
 * POST /api/reports
 */
export const createReport = async (data) => {
  const response = await axiosInstance.post("/reports", data);
  return response.data;
};

/**
 * Moderator/Admin lấy danh sách báo cáo (legacy)
 * GET /api/reports
 */
export const getReports = async (params = {}) => {
  const response = await axiosInstance.get("/reports", { params });
  return response.data;
};

/**
 * Admin lấy toàn bộ báo cáo (đầy đủ populate)
 * GET /api/reports/admin
 *
 * @param {Object} params - { status, reason, page, limit }
 */
export const getAdminReports = async (params = {}) => {
  const response = await axiosInstance.get("/reports/admin", { params });
  return response.data;
};

/**
 * Admin đồng ý báo cáo -> Gỡ bỏ tài liệu vi phạm
 * PATCH /api/reports/:id/resolve
 *
 * @param {string} reportId
 * @param {Object} data - { adminNote? }
 */
export const resolveReport = async (reportId, data = {}) => {
  const response = await axiosInstance.patch(
    `/reports/${reportId}/resolve`,
    data,
  );
  return response.data;
};

/**
 * Admin bác bỏ báo cáo -> Khôi phục tài liệu
 * PATCH /api/reports/:id/reject
 *
 * @param {string} reportId
 * @param {Object} data - { adminNote? }
 */
export const rejectReport = async (reportId, data = {}) => {
  const response = await axiosInstance.patch(
    `/reports/${reportId}/reject`,
    data,
  );
  return response.data;
};

// Mapping lý do báo cáo sang tiếng Việt
export const REPORT_REASON_LABELS = {
  COPYRIGHT_INFRINGEMENT: "Vi phạm bản quyền",
  INAPPROPRIATE_CONTENT: "Nội dung không phù hợp",
  WRONG_CATEGORY: "Sai danh mục",
  SPAM: "Spam / Trùng lặp",
  OTHER: "Lý do khác",
};

const reportsAPI = {
  createReport,
  getReports,
  getAdminReports,
  resolveReport,
  rejectReport,
  REPORT_REASON_LABELS,
};

export default reportsAPI;
