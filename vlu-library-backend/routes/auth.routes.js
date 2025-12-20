const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { checkAuth } = require("../middleware/auth.middleware");

/**
 * Authentication Routes
 * Quản lý người dùng & phân quyền
 */

/**
 * route   POST /api/auth/register
 * desc    Đăng ký tài khoản mới (API 1.1 - F1)
 * access  Public (Guest)
 * body    { name, email, password, confirmPassword }
 *
 * Note: Tài khoản tự động active (không gửi email kích hoạt)
 */
router.post("/register", authController.register);

/**
 * route   POST /api/auth/login
 * desc    Đăng nhập (API 1.2 - F2)
 * access  Public
 * body    { email, password }
 * returns { user, accessToken, refreshToken }
 */
router.post("/login", authController.login);

/**
 * route   POST /api/auth/logout
 * desc    Đăng xuất: Xóa tất cả refresh token của user (logout all devices)
 * access  Authenticated
 */
router.post("/logout", checkAuth, authController.logout);

/**
 * route   PUT /api/auth/change-password
 * desc    Đổi mật khẩu (API 1.5)
 * access  Authenticated
 * body    { currentPassword, newPassword }
 */
router.put("/change-password", checkAuth, authController.changePassword);

/**
 * route   POST /api/auth/refresh
 * desc    Làm mới Access Token (API 1.10)
 * access  Public (dùng refreshToken)
 * body    { refreshToken }
 * returns { accessToken, refreshToken } (cả hai đều MỚI - Token Rotation)
 */
router.post("/refresh", authController.refresh);

/**
 * route   POST /api/auth/logout/revoke
 * desc    Thu hồi 1 refresh token cụ thể (body: { refreshToken }, API 1.12)
 * access  Public (token string required)
 */
router.post("/logout/revoke", authController.revoke);

/**
 * route   GET /api/auth/me
 * desc    Lấy thông tin người dùng hiện tại (API 1.9)
 * access  Authenticated
 */
router.get("/me", checkAuth, authController.me);

module.exports = router;
