const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { checkAuth } = require("../middleware/auth.middleware");

/**
 * Notification Routes
 * Mount point: /api/notifications
 * Tất cả routes yêu cầu đăng nhập
 */

/**
 * GET /api/notifications/unread-count
 * Phải đặt TRƯỚC /:id để tránh conflict
 */
router.get("/unread-count", checkAuth, notificationController.getUnreadCount);

/**
 * PUT /api/notifications/read-all
 * Phải đặt TRƯỚC /:id/read để tránh conflict
 */
router.put("/read-all", checkAuth, notificationController.markAllAsRead);

/**
 * GET /api/notifications
 * Lấy danh sách thông báo (có phân trang)
 */
router.get("/", checkAuth, notificationController.getNotifications);

/**
 * PUT /api/notifications/:id/read
 * Đánh dấu 1 thông báo đã đọc
 */
router.put("/:id/read", checkAuth, notificationController.markAsRead);

module.exports = router;
