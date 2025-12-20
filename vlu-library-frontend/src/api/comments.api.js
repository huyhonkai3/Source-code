import axiosInstance from "./axiosConfig";

/**
 * Comments API Service
 * Các hàm gọi API liên quan đến bình luận tài liệu
 *
 * API Endpoints:
 * - GET  /api/comments/document/:docId - Lấy danh sách
 * - POST /api/comments - Thêm bình luận
 * - PUT  /api/comments/:id - Cập nhật bình luận
 * - DELETE /api/comments/:id - Xóa bình luận
 */

const commentsAPI = {
  /**
   * Lấy danh sách bình luận theo docId
   * @param {string} docId - ID tài liệu
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại (default: 1)
   * @param {number} params.limit - Số lượng mỗi trang (default: 20)
   * @returns {Promise} Response data
   *
   * Example:
   * const response = await commentsAPI.getByDocId("507f1f77bcf86cd799439011", { page: 1, limit: 20 });
   *
   * Response:
   * {
   *   status: "success",
   *   data: {
   *     comments: [...],
   *     pagination: { currentPage, totalPages, totalComments, limit }
   *   }
   * }
   */
  getByDocId: async (docId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/comments/document/${docId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Thêm bình luận mới
   * @param {Object} data - Dữ liệu bình luận
   * @param {string} data.docId - ID tài liệu (required)
   * @param {string} data.content - Nội dung bình luận (required, max 500 chars)
   * @returns {Promise} Response data
   *
   * Example:
   * const response = await commentsAPI.add({
   *   docId: "507f1f77bcf86cd799439011",
   *   content: "Tài liệu rất hữu ích!"
   * });
   *
   * Response:
   * {
   *   status: "success",
   *   code: 201,
   *   message: "Gửi bình luận thành công",
   *   data: { comment: {...} }
   * }
   */
  add: async (data) => {
    try {
      const response = await axiosInstance.post("/comments", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật bình luận
   * @param {string} id - ID bình luận
   * @param {Object} data - Dữ liệu cập nhật
   * @param {string} data.content - Nội dung mới (required, max 500 chars)
   * @returns {Promise} Response data
   *
   * Example:
   * const response = await commentsAPI.update("507f1f77bcf86cd799439011", {
   *   content: "Nội dung đã chỉnh sửa"
   * });
   *
   * Response:
   * {
   *   status: "success",
   *   code: 200,
   *   message: "Cập nhật bình luận thành công",
   *   data: { comment: {...} }
   * }
   */
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/comments/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa bình luận
   * @param {string} id - ID bình luận
   * @returns {Promise} Response data
   *
   * Example:
   * const response = await commentsAPI.delete("507f1f77bcf86cd799439011");
   *
   * Response:
   * {
   *   status: "success",
   *   code: 200,
   *   message: "Xóa bình luận thành công"
   * }
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default commentsAPI;
