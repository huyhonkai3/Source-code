const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { checkAuth } = require("../middleware/auth.middleware");

// --- CÁC ROUTE NGƯỜI DÙNG CÁ NHÂN ---

// 1. Xem hồ sơ (GET)- Access: Tất cả người dùng đã đăng nhập - API 1.9
// URL: /api/users/profile
router.get("/profile", checkAuth, userController.getProfile);

// 2. Cập nhật hồ sơ (PUT)
// URL: /api/users/profile
router.put("/profile", checkAuth, userController.updateProfile);

// 3. Đổi mật khẩu (PUT)
// URL: /api/users/change-password
router.put("/change-password", checkAuth, userController.changePassword);

// 4. Gửi yêu cầu nâng cấp lên Author (POST)
// URL: /api/users/upgrade-request
// Access: User đã đăng nhập
router.post("/upgrade-request", checkAuth, userController.requestUpgrade);

// 5. Lấy trạng thái yêu cầu nâng cấp (GET)
// URL: /api/users/upgrade-request/status
// Access: User đã đăng nhập
router.get(
  "/upgrade-request/status",
  checkAuth,
  userController.getMyRequestStatus,
);

module.exports = router;
