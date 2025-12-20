import axiosInstance from "./axiosConfig";

/**
 * Reviews API Service
 * Các hàm gọi API liên quan đến đánh giá tài liệu
 */

const reviewsAPI = {
  /**
   * Thêm đánh giá mới
   * @param {Object} data - Dữ liệu đánh giá
   * @param {string} data.docId - ID tài liệu
   * @param {number} data.rating - Đánh giá (1-5)
   * @param {string} data.content - Nội dung đánh giá
   * @returns {Promise} Response data
   */
  add: async (data) => {
    try {
      const response = await axiosInstance.post("/reviews", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách đánh giá theo docId
   * @param {string} docId - ID tài liệu
   * @param {Object} params - Query parameters
   * @param {number} params.page - Trang hiện tại
   * @param {number} params.limit - Số lượng mỗi trang
   * @returns {Promise} Response data
   */
  getByDocId: async (docId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/reviews/${docId}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Kiểm tra user đã review chưa
   * @param {string} docId - ID tài liệu
   * @returns {Promise} Response data
   */
  checkUserReview: async (docId) => {
    try {
      const response = await axiosInstance.get(`/reviews/check/${docId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cập nhật đánh giá
   * @param {string} id - ID đánh giá
   * @param {Object} data - Dữ liệu cập nhật
   * @returns {Promise} Response data
   */
  update: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/reviews/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Xóa đánh giá
   * @param {string} id - ID đánh giá
   * @returns {Promise} Response data
   */
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/reviews/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reviewsAPI;
