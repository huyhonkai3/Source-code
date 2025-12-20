const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const { checkAuth, checkRole } = require("../middleware/auth.middleware");

/**
 * Document Admin Routes
 * Module 2: Quản lý tài liệu (Admin & Moderator APIs)
 * TẤT CẢ các routes trong file này đều cần:
 * 1. checkAuth - User phải đăng nhập
 * 2. checkRole(['Admin', 'Moderator']) - User phải có vai trò Admin hoặc Moderator
 *
 * Admin: Có toàn quyền (CRUD, thống kê, duyệt bài)
 * Moderator: Chỉ được xem danh sách và duyệt/từ chối tài liệu
 */

/**
 * route   PUT /api/admin/documents/:id/status
 * desc    Kiểm duyệt tài liệu (API 2.6 - F7)
 * access  Moderator
 * params  id - Document ID
 * body    { status: 'approved' | 'rejected', reason?: string }
 * returns { document: Object }
 *
 * - Chỉ tài liệu có status='pending' mới được kiểm duyệt
 * - Nếu status='rejected' thì reason là bắt buộc
 * - Cập nhật reviewedBy, reviewedAt, rejectionReason
 */
router.put(
  "/:id/status",
  checkAuth,
  checkRole(["Moderator", "Admin"]),
  documentController.reviewDocument,
);

/**
 * route   GET /api/admin/documents
 * desc    Lấy danh sách tài liệu cho Admin (API 2.8)
 * access  Admin, Moderator
 * returns { documents: Array, pagination: Object }
 *
 * KHÁC BIỆT với API 2.7 (public):
 * - API này cho phép filter theo status (pending, rejected)
 * - API public (2.7) chỉ hiển thị approved
 * - Controller sẽ tự phân biệt dựa trên req.originalUrl
 */
router.get(
  "/",
  checkAuth,
  checkRole(["Admin", "Moderator"]),
  documentController.getDocuments,
);

/**
 * route   GET /api/admin/documents/stats
 * desc    Lấy dashboard thống kê (API 2.13 - F15)
 * access  Admin
 * query   period (bỏ qua trong MVP, mặc định là 'all')
 * returns { overview: Object, topViewed: Array, topDownloaded: Array, categoryDistribution: Array }
 */
router.get(
  "/stats",
  checkAuth,
  checkRole(["Admin"]), // CHỈ ADMIN
  documentController.getDashboardStats,
);

module.exports = router;
