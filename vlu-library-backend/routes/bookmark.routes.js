const express = require("express");
const router = express.Router();
const {
  saveBookmark,
  getBookmark,
} = require("../controllers/bookmark.controller");
const { checkAuth } = require("../middleware/auth.middleware");

/**
 * Bookmark Routes
 * Base: /api/bookmarks
 * Tất cả routes yêu cầu đăng nhập
 */

// POST /api/bookmarks - Lưu/cập nhật vị trí đọc
router.post("/", checkAuth, saveBookmark);

// GET /api/bookmarks/:documentId - Lấy vị trí đọc đã lưu
router.get("/:documentId", checkAuth, getBookmark);

module.exports = router;
