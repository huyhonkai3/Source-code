import axiosInstance from "./axiosConfig";

/**
 * Comments API Service
 * Các hàm gọi API liên quan đến bình luận tài liệu
 * UPDATED: Hỗ trợ Nested Comments (2 cấp)
 *
 * API Endpoints:
 * - GET  /api/comments/document/:docId - Lấy danh sách (flat array)
 * - POST /api/comments - Thêm bình luận / Reply
 * - PUT  /api/comments/:id - Cập nhật bình luận
 * - DELETE /api/comments/:id - Xóa bình luận (và replies nếu là root)
 * - POST /api/comments/:id/like - Toggle like
 */

const commentsAPI = {
  /**
   * Lấy danh sách bình luận theo docId (Flat Array)
   * Frontend sẽ tự group theo parentId
   *
   * @param {string} docId - ID tài liệu
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại (default: 1)
   * @param {number} params.limit - Số lượng mỗi trang (default: 50)
   * @returns {Promise} Response data
   *
   * Response:
   * {
   *   status: "success",
   *   data: {
   *     comments: [...], // Flat array bao gồm cả root và replies
   *     pagination: {
   *       currentPage,
   *       totalPages,
   *       totalComments,      // Tổng số (root + replies)
   *       totalRootComments,  // Chỉ root comments
   *       limit
   *     }
   *   }
   * }
   */
  getByDocId: async (docId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/comments/document/${docId}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 50, // Tăng limit để lấy cả replies
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Thêm bình luận mới hoặc Reply
   * @param {Object} data - Dữ liệu bình luận
   * @param {string} data.docId - ID tài liệu (required)
   * @param {string} data.content - Nội dung bình luận (required, max 500 chars)
   * @param {string} data.parentId - ID comment cha (optional, null = root comment)
   * @returns {Promise} Response data
   *
   * Example - Root Comment:
   * const response = await commentsAPI.add({
   *   docId: "507f1f77bcf86cd799439011",
   *   content: "Tài liệu rất hữu ích!"
   * });
   *
   * Example - Reply:
   * const response = await commentsAPI.add({
   *   docId: "507f1f77bcf86cd799439011",
   *   content: "Đồng ý với bạn!",
   *   parentId: "507f1f77bcf86cd799439022"
   * });
   *
   * Response:
   * {
   *   status: "success",
   *   code: 201,
   *   message: "Gửi bình luận thành công" | "Trả lời bình luận thành công",
   *   data: { comment: {...} }
   * }
   */
  add: async (data) => {
    try {
      const payload = {
        docId: data.docId,
        content: data.content,
      };

      // Chỉ thêm parentId nếu có giá trị (reply)
      if (data.parentId) {
        payload.parentId = data.parentId;
      }

      const response = await axiosInstance.post("/comments", payload);
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
   * NOTE: Nếu xóa root comment, tất cả replies cũng sẽ bị xóa
   *
   * @param {string} id - ID bình luận
   * @returns {Promise} Response data
   *
   * Response:
   * {
   *   status: "success",
   *   code: 200,
   *   message: "Xóa bình luận thành công" | "Đã xóa bình luận và N phản hồi",
   *   data: { deletedCount: number }
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

  /**
   * Toggle like bình luận (Like/Unlike)
   * @param {string} id - ID bình luận
   * @returns {Promise} Response data
   */
  toggleLike: async (id) => {
    try {
      const response = await axiosInstance.post(`/comments/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default commentsAPI;
