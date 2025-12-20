const express = require("express");
const router = express.Router();

// Import Controller dành riêng cho Admin
const userAdminController = require("../controllers/user.admin.controller");
// Import Middleware
const { checkAuth, checkRole } = require("../middleware/auth.middleware");

// --- CÁC ROUTE QUẢN LÝ USER ---
// Lưu ý: File này được mount tại '/api/admin' trong index.js

// 1. Lấy danh sách người dùng (Có phân trang, lọc)
// URL thực tế: GET /api/admin/users
// Quyền: Admin
router.get(
  "/users",
  checkAuth,
  checkRole(["Admin"]),
  userAdminController.getAllUsers,
);

// 2. Thay đổi vai trò người dùng (Thăng chức/Giáng chức)
// URL thực tế: PUT /api/admin/users/:id/role
// Quyền: Admin
router.put(
  "/users/:id/role",
  checkAuth,
  checkRole(["Admin"]),
  userAdminController.changeRole,
);

// 3. Khóa/Mở khóa tài khoản
// URL thực tế: PUT /api/admin/users/:id/status
// Quyền: Admin và Moderator (Moderator được phép khóa user spam)
router.put(
  "/users/:id/status",
  checkAuth,
  checkRole(["Admin", "Moderator"]),
  userAdminController.changeStatus,
);

// 4. Lấy danh sách yêu cầu nâng cấp Author
// URL thực tế: GET /api/admin/upgrade-requests
// Quyền: Admin
router.get(
  "/upgrade-requests",
  checkAuth,
  checkRole(["Admin"]),
  userAdminController.getUpgradeRequests,
);

// 5. Xét duyệt yêu cầu nâng cấp (Chấp thuận/Từ chối)
// URL thực tế: PUT /api/admin/upgrade-requests/:id/review
// Quyền: Admin
router.put(
  "/upgrade-requests/:id/review",
  checkAuth,
  checkRole(["Admin"]),
  userAdminController.reviewUpgradeRequest,
);

module.exports = router;
