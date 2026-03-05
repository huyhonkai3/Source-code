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
 */
router.post(
  "/",
  checkAuth,
  checkRole(["User", "Author", "Moderator", "Admin"]),
  reportController.createReport,
);

/**
 * GET /api/reports/admin
 * Admin lấy tất cả báo cáo (đặt TRƯỚC /:id để tránh conflict)
 * Access: Admin only
 * Query: { status, reason, page, limit }
 */
router.get(
  "/admin",
  checkAuth,
  checkRole(["Admin"]),
  reportController.getAdminReports,
);

/**
 * GET /api/reports
 * Moderator/Admin lấy danh sách báo cáo
 * Access: Admin, Moderator
 */
router.get(
  "/",
  checkAuth,
  checkRole(["Admin", "Moderator"]),
  reportController.getReports,
);

/**
 * PATCH /api/reports/:id/resolve
 * Admin đồng ý báo cáo -> Gỡ bỏ tài liệu
 * Access: Admin only
 * Body: { adminNote? }
 */
router.patch(
  "/:id/resolve",
  checkAuth,
  checkRole(["Admin"]),
  reportController.resolveReportAdmin,
);

/**
 * PATCH /api/reports/:id/reject
 * Admin bác bỏ báo cáo -> Khôi phục tài liệu
 * Access: Admin only
 * Body: { adminNote? }
 */
router.patch(
  "/:id/reject",
  checkAuth,
  checkRole(["Admin"]),
  reportController.rejectReportAdmin,
);

module.exports = router;
