import axiosInstance from "./axiosConfig";

/**
 * Documents API Service
 * API endpoints for document operations
 */

/**
 * Get all documents with filtering and pagination (PUBLIC)
 * @param {Object} params - Query parameters
 * @param {string} params.q - Search keyword
 * @param {string} params.category - Category ID
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sort - Sort order (newest, oldest, mostViewed, mostDownloaded)
 * @param {number} params.yearFrom - Start year filter
 * @param {number} params.yearTo - End year filter
 * @param {string} params.type - Document type filter
 * @returns {Promise} Response data từ server
 */
export const getAll = async (params) => {
  try {
    const response = await axiosInstance.get("/documents", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all documents for ADMIN (includes all statuses)
 * @param {Object} params - Query parameters
 * @param {string} params.q - Search keyword
 * @param {string} params.status - Status filter (approved, pending, rejected, all)
 * @param {string} params.category - Category ID
 * @param {string} params.startDate - Start date filter
 * @param {string} params.endDate - End date filter
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.sort - Sort order
 * @returns {Promise} Response data từ server
 */
export const getAllAdmin = async (params) => {
  try {
    const response = await axiosInstance.get("/admin/documents", { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get document statistics for Admin Dashboard
 * API: GET /api/admin/documents/stats
 * @returns {Promise} Response data with overview, topViewed, topDownloaded, categoryDistribution
 *
 * Response structure:
 * {
 *   status: "success",
 *   data: {
 *     overview: {
 *       totalDocuments: number,
 *       pendingDocuments: number,
 *       activeUsers: number,
 *       totalViews: number,
 *       totalDownloads: number
 *     },
 *     topViewed: Array,
 *     topDownloaded: Array,
 *     categoryDistribution: Array,
 *     period: string,
 *     generatedAt: string
 *   }
 * }
 */
export const getDocumentStats = async () => {
  try {
    const response = await axiosInstance.get("/admin/documents/stats");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get document by ID
 * @param {string} id - Document ID
 * @returns {Promise} Response data
 */
export const getById = async (id) => {
  try {
    const response = await axiosInstance.get(`/documents/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Upload new document
 * @param {FormData} formData - Form data with file and metadata
 * @param {Function} onProgress - Callback function to handle upload progress (0-100)
 * @returns {Promise} Response data
 */
export const upload = async (formData, onProgress) => {
  try {
    const response = await axiosInstance.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
        }
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Track document action (view/download)
 * @param {string} id - Document ID
 * @param {string} type - Action type ('view' or 'download')
 * @returns {Promise} Response data
 */
export const track = async (id, type) => {
  try {
    const response = await axiosInstance.post(`/documents/${id}/track`, {
      type,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Track document view (shorthand)
 * @param {string} id - Document ID
 * @returns {Promise} Response data
 */
export const trackView = async (id) => {
  return track(id, "view");
};

/**
 * Track document download (shorthand)
 * @param {string} id - Document ID
 * @returns {Promise} Response data
 */
export const trackDownload = async (id) => {
  return track(id, "download");
};

/**
 * Get related documents by category
 * @param {string} categoryId - Category ID
 * @param {string} currentDocId - Current document ID to exclude
 * @param {number} limit - Number of documents to fetch
 * @returns {Promise} Response data
 */
export const getRelated = async (categoryId, currentDocId, limit = 4) => {
  try {
    const response = await axiosInstance.get("/documents", {
      params: {
        category: categoryId,
        limit: limit + 1,
        sort: "newest",
      },
    });

    if (response.data?.data?.documents) {
      response.data.data.documents = response.data.data.documents
        .filter((doc) => (doc._id || doc.id) !== currentDocId)
        .slice(0, limit);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get Linked Open Data metadata from Wikidata (with backend cache)
 * @param {string} id - Document ID
 * @returns {Promise} Response data
 */
export const getLOD = async (id) => {
  try {
    const response = await axiosInstance.get(`/documents/${id}/lod`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Download document
 * @param {string} id - Document ID
 * @returns {Promise} File blob
 */
export const download = async (id) => {
  try {
    const response = await axiosInstance.get(`/documents/${id}/download`, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get my documents (Author Dashboard)
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.q - Search keyword
 * @param {string} params.status - Filter by status (pending, approved, rejected)
 * @param {string} params.sort - Sort order
 * @returns {Promise} Response data with documents, pagination, and stats
 */
export const getMyDocuments = async (params) => {
  try {
    const response = await axiosInstance.get("/documents/my-documents", {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete document
 * @param {string} id - Document ID
 * @returns {Promise} Response data
 */
export const deleteDocument = async (id) => {
  try {
    const response = await axiosInstance.delete(`/documents/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update document
 * Hỗ trợ cả 2 mode:
 * - JSON data (không có file mới)
 * - FormData (có file mới)
 *
 * @param {string} id - Document ID
 * @param {Object|FormData} data - Document data to update
 * @returns {Promise} Response data
 */
export const updateDocument = async (id, data) => {
  try {
    // Check if data is FormData (has file)
    const isFormData = data instanceof FormData;

    const config = isFormData
      ? {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      : {};

    const response = await axiosInstance.put(`/documents/${id}`, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Review document (Admin/Moderator)
 * @param {string} id - Document ID
 * @param {Object} data - Review data
 * @param {string} data.status - 'approved' or 'rejected'
 * @param {string} data.reason - Rejection reason (required if status is 'rejected')
 * @returns {Promise} Response data
 */
export const reviewDocument = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `/admin/documents/${id}/status`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy tài liệu nổi bật cho Landing Page
 * @param {Object} params - { type: 'newest'|'popular'|'most-downloaded', limit: 8 }
 * @returns {Promise} Response chứa danh sách tài liệu
 */
export const getFeatured = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/documents/featured", {
      params: {
        type: params.type || "newest",
        limit: params.limit || 8,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy thống kê công khai cho Landing Page
 * @returns {Promise} Response chứa { documents, users, views, downloads }
 */
export const getPublicStats = async () => {
  try {
    const response = await axiosInstance.get("/documents/public-stats");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy thống kê tài liệu của Author
 * GET /api/documents/stats/author
 * @param {Object} params - Query parameters
 * @param {string} params.period - 'day' | 'month' | 'year'
 * @param {string} params.date - ISO date string (ngày được chọn)
 * @returns {Promise} Response chứa { chartData, summary }
 */
export const getAuthorStats = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/documents/stats/author", {
      params: {
        period: params.period || "month",
        date: params.date || new Date().toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Get author stats error:", error);
    throw error;
  }
};

/**
 * Author gửi yêu cầu chỉnh sửa tài liệu đã xuất bản
 * POST /api/documents/:id/edit-requests
 * @param {string} id - Document ID
 * @param {string} reason - Lý do xin chỉnh sửa
 */
export const requestEdit = async (id, reason) => {
  try {
    const response = await axiosInstance.post(
      `/documents/${id}/edit-requests`,
      { reason },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Admin lấy danh sách yêu cầu chỉnh sửa tài liệu
 * GET /api/admin/documents/edit-requests
 * @param {Object} params - { status, page, limit }
 */
export const getEditRequests = async (params = {}) => {
  try {
    const response = await axiosInstance.get("/admin/documents/edit-requests", {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Admin duyệt / từ chối yêu cầu chỉnh sửa
 * PUT /api/admin/documents/edit-requests/:reqId/review
 * @param {string} reqId - EditRequest ID
 * @param {Object} data - { status: 'approved'|'rejected', adminReason?: string }
 */
export const reviewEditRequest = async (reqId, data) => {
  try {
    const response = await axiosInstance.put(
      `/admin/documents/edit-requests/${reqId}/review`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Admin sửa trực tiếp tài liệu (bỏ qua ràng buộc status - có Safeguard)
 * PUT /api/admin/documents/:id/direct-edit
 * @param {string} id - Document ID
 * @param {Object} data - { safeguardConfirmed: true, title, ... }
 */
export const adminDirectEdit = async (id, data) => {
  try {
    const response = await axiosInstance.put(
      `/admin/documents/${id}/direct-edit`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export as default object
const documentsAPI = {
  getAll,
  getAllAdmin,
  getDocumentStats,
  getById,
  upload,
  track,
  trackView,
  getRelated,
  trackDownload,
  getLOD,
  download,
  getMyDocuments,
  deleteDocument,
  updateDocument,
  reviewDocument,
  getFeatured,
  getPublicStats,
  getAuthorStats,
  requestEdit,
  getEditRequests,
  reviewEditRequest,
  adminDirectEdit,
};

export default documentsAPI;
