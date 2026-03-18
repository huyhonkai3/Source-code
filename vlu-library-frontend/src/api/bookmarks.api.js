import axiosInstance from "./axiosConfig";

/**
 * Bookmarks API Service
 * Lưu và lấy vị trí đọc tài liệu
 */

/**
 * Lưu hoặc cập nhật vị trí đọc
 * POST /api/bookmarks
 *
 * @param {string} documentId - ID tài liệu
 * @param {string} position   - Số trang (PDF) hoặc epubcfi string (EPUB)
 */
export const saveBookmark = async (documentId, position) => {
  try {
    const response = await axiosInstance.post("/bookmarks", {
      documentId,
      position: String(position),
    });
    return response.data;
  } catch (error) {
    // Không throw để tránh crash UX khi lưu bookmark thất bại
    console.error("saveBookmark error:", error);
    return null;
  }
};

/**
 * Lấy vị trí đọc đã lưu
 * GET /api/bookmarks/:documentId
 *
 * @param {string} documentId - ID tài liệu
 * @returns {string|null} position string hoặc null nếu chưa có
 */
export const getBookmark = async (documentId) => {
  try {
    const response = await axiosInstance.get(`/bookmarks/${documentId}`);
    return response.data?.data?.bookmark?.position || null;
  } catch (error) {
    // 404 hoặc lỗi mạng -> trả null, không crash
    console.error("getBookmark error:", error);
    return null;
  }
};

const bookmarksAPI = { saveBookmark, getBookmark };
export default bookmarksAPI;
