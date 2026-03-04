const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report.controller");
const { checkAuth, checkRole } = require("../middleware/auth.middleware");

/**
 * Report Routes - Notice & Takedown System
 * Base: /api/reports
 */

/**
 * POST /api/reports
 * Người dùng báo cáo vi phạm một tài liệu
 * Access: Authenticated (User, Author, Moderator, Admin)
 *
 * Body: { documentId, reason, description }
 */
router.post(
  "/",
  checkAuth,
  checkRole(["User", "Author", "Moderator", "Admin"]),
  reportController.createReport,
);

/**
 * GET /api/reports
 * Admin lấy danh sách tất cả báo cáo
 * Access: Admin, Moderator
 *
 * Query: { status, reason, page, limit }
 */
router.get(
  "/",
  checkAuth,
  checkRole(["Admin", "Moderator"]),
  reportController.getReports,
);

/**
 * PATCH /api/reports/:id/resolve
 * Admin xử lý (giải quyết hoặc bác bỏ) một báo cáo
 * Access: Admin only
 *
 * Body: { action: "DELETE_DOCUMENT" | "RESTORE_DOCUMENT", adminNote? }
 */
router.patch(
  "/:id/resolve",
  checkAuth,
  checkRole(["Admin"]),
  reportController.resolveReport,
);

module.exports = router;
