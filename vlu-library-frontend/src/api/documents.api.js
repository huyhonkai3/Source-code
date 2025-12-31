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
 * @param {string} id - Document ID
 * @param {Object} data - Document data to update
 * @returns {Promise} Response data
 */
export const updateDocument = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/documents/${id}`, data);
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
  download,
  getMyDocuments,
  deleteDocument,
  updateDocument,
  reviewDocument,
};

export default documentsAPI;
