import axiosInstance from "./axiosConfig";

/**
 * Categories API Service
 * Các API xử lý danh mục
 */

/**
 * Lấy toàn bộ danh mục
 * @returns {Promise} Response data với danh sách categories
 */
export const getAll = async () => {
  try {
    const response = await axiosInstance.get("/categories");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Lấy danh mục theo ID
 * @param {string} id - Category ID
 * @returns {Promise} Response data
 */
export const getById = async (id) => {
  try {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tạo danh mục (Chỉ Admin có quyền thực hiện)
 * @param {Object} categoryData - Category data
 * @returns {Promise} Response data
 */
export const create = async (categoryData) => {
  try {
    const response = await axiosInstance.post(
      "/admin/categories",
      categoryData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật danh mục (Chỉ Admin có quyền thực hiện)
 * @param {string} id - Category ID
 * @param {Object} categoryData - Updated category data
 * @returns {Promise} Response data
 */
export const update = async (id, categoryData) => {
  try {
    const response = await axiosInstance.put(
      `/admin/categories/${id}`,
      categoryData,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa danh mục (Chỉ Admin có quyền thực hiện)
 * @param {string} id - Category ID
 * @returns {Promise} Response data
 */
export const deleteCategory = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const categoriesAPI = {
  getAll,
  getById,
  create,
  update,
  delete: deleteCategory,
};

export default categoriesAPI;
