import axiosInstance from "./axiosConfig";

/**
 * Reports API Service - Notice & Takedown System
 * Kết nối đến /api/reports
 */

/**
 * Người dùng gửi báo cáo vi phạm tài liệu
 * POST /api/reports
 *
 * @param {Object} data
 * @param {string} data.documentId - ID tài liệu bị báo cáo
 * @param {string} data.reason    - Lý do: COPYRIGHT_INFRINGEMENT | INAPPROPRIATE_CONTENT | WRONG_CATEGORY | SPAM | OTHER
 * @param {string} data.description - Mô tả chi tiết (optional)
 * @returns {Promise}
 */
export const createReport = async (data) => {
  try {
    const response = await axiosInstance.post("/reports", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Admin lấy danh sách báo cáo
 * GET /api/reports
 *
 * @param {Object} params
 * @param {string} params.status  - PENDING | RESOLVED | REJECTED | all
 * @param {string} params.reason  - Filter theo lý do
 * @param {number} params.page
 * @param {number} params.limit
 * @returns {Promise}
 */
export const getReports = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/reports", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Admin xử lý báo cáo
 * PATCH /api/reports/:id/resolve
 *
 * @param {string} reportId - Report ID
 * @param {Object} data
 * @param {string} data.action    - "DELETE_DOCUMENT" | "RESTORE_DOCUMENT"
 * @param {string} data.adminNote - Ghi chú của Admin (optional)
 * @returns {Promise}
 */
export const resolveReport = async (reportId, data) => {
  try {
    const response = await axiosInstance.patch(
      `/reports/${reportId}/resolve`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
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
  resolveReport,
  REPORT_REASON_LABELS,
};

export default reportsAPI;
