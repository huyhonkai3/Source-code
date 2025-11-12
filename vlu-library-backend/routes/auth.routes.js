const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * Authentication Routes
 * Module 1: Quản lý người dùng & phân quyền
 */

/**
 * route   POST /api/auth/register
 * desc    Đăng ký tài khoản mới (API 1.1 - F1)
 * access  Public (Guest)
 * body    { name, email, password, confirmPassword }
 * 
 * Note: Tài khoản tự động active (không gửi email kích hoạt)
 */
router.post('/register', authController.register);

/**
 * route   POST /api/auth/login
 * desc    Đăng nhập (API 1.2 - F2)
 * access  Public
 * body    { email, password }
 * returns { user, accessToken, refreshToken }
 */
router.post('/login', authController.login);

/**
 * route   POST /api/auth/refresh
 * desc    Làm mới Access Token (API 1.10)
 * access  Public (dùng refreshToken)
 * body    { refreshToken }
 * returns { accessToken, refreshToken } (cả hai đều MỚI - Token Rotation)
 */
router.post('/refresh', authController.refresh);

module.exports = router;
