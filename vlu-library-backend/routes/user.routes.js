const express = require("express");
const router = express.Router();

// Import Controllers
const userController = require("../controllers/user.controller");

// Import Middlewares
const { checkAuth } = require("../middleware/auth.middleware");
const { uploadAvatar } = require("../middleware/upload.middleware");

/**
 * User Routes
 * Base path: /api/users
 *
 * Các route dành cho user đã đăng nhập
 */

// ==================== PROFILE ====================

/**
 * @route   GET /api/users/profile
 * @desc    Lấy thông tin cá nhân của user đang đăng nhập
 * @access  Private (Yêu cầu đăng nhập)
 */
router.get("/profile", checkAuth, userController.getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Cập nhật thông tin cá nhân
 * @access  Private
 * @body    { name, phoneNumber, address }
 */
router.put("/profile", checkAuth, userController.updateProfile);

/**
 * @route   POST /api/users/avatar
 * @desc    Upload và cập nhật ảnh đại diện
 * @access  Private
 * @body    FormData với field 'avatar' chứa file ảnh
 * @note    Chấp nhận: JPG, PNG, GIF, WEBP. Max size: 5MB
 */
router.post("/avatar", checkAuth, uploadAvatar, userController.uploadAvatar);

// ==================== PASSWORD ====================

/**
 * @route   PUT /api/users/change-password
 * @desc    Đổi mật khẩu
 * @access  Private
 * @body    { currentPassword, newPassword, confirmPassword }
 */
router.put("/change-password", checkAuth, userController.changePassword);

// ==================== AUTHOR UPGRADE ====================

/**
 * @route   POST /api/users/upgrade-request
 * @desc    Gửi yêu cầu nâng cấp lên Author
 * @access  Private (Chỉ User role)
 * @body    { reason }
 */
router.post("/upgrade-request", checkAuth, userController.requestUpgrade);

/**
 * @route   GET /api/users/upgrade-request/status
 * @desc    Lấy trạng thái yêu cầu nâng cấp mới nhất
 * @access  Private
 */
router.get(
  "/upgrade-request/status",
  checkAuth,
  userController.getMyRequestStatus,
);

module.exports = router;
