const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { checkAuth, checkRole } = require("../middleware/auth.middleware");

/**
 * Category Admin Routes
 * Module 2: Quản lý danh mục (Admin APIs)
 * TẤT CẢ các routes trong file này đều cần:
 * 1. checkAuth - User phải đăng nhập
 * 2. checkRole(['Admin']) - User phải có vai trò Admin
 */

/**
 * @route   GET /api/admin/categories
 * @desc    Lấy danh sách danh mục cho Admin (documentCount = TỔNG tất cả status)
 * @access  Admin
 * @returns { categories: Array, total: Number }
 *
 * Khác với GET /api/categories (Public):
 * - Public: documentCount = số tài liệu APPROVED
 * - Admin: documentCount = TỔNG số tài liệu (pending + approved + rejected)
 */
router.get(
  "/",
  checkAuth,
  checkRole(["Admin"]),
  categoryController.getAllCategories,
);

/**
 * @route   POST /api/admin/categories
 * @desc    Tạo danh mục mới (API 2.1 - F10)
 * @access  Admin
 * @body    { name, description?, parentId? }
 * @returns { category: Object }
 */
router.post(
  "/",
  checkAuth,
  checkRole(["Admin"]),
  categoryController.createCategory,
);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Cập nhật danh mục (API 2.2 - F10)
 * @access  Admin
 * @params  id - Category ID
 * @body    { name?, description?, parentId? }
 * @returns { category: Object }
 */
router.put(
  "/:id",
  checkAuth,
  checkRole(["Admin"]),
  categoryController.updateCategory,
);

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Xóa danh mục (API 2.3 - F10)
 * @access  Admin
 * @params  id - Category ID
 * @returns { message: String }
 * @note    Không cho phép xóa danh mục có documentCount > 0
 */
router.delete(
  "/:id",
  checkAuth,
  checkRole(["Admin"]),
  categoryController.deleteCategory,
);

module.exports = router;
