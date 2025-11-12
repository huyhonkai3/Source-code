const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

/**
 * Category Public Routes
 * Module 2: Quản lý danh mục (Public APIs)
 */

/**
 * route   GET /api/categories
 * desc    Lấy danh sách tất cả danh mục (API 2.4 - F10)
 * access  Public (không cần đăng nhập)
 * returns { categories: Array, total: Number }
 */
router.get("/", categoryController.getAllCategories);

module.exports = router;
