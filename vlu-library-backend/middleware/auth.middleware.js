const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * Middleware xác thực (Authentication)
 * Verify JWT Access Token và gắn thông tin user vào req.user
 * Đặt trước các route cần bảo vệ
 */
const checkAuth = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization (dạng: "Bearer <token>")
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "error",
            code: 401,
            message: "Unauthorized - Token không được cung cấp",
        });
        }

        // Tách token ra khỏi "Bearer "
        const token = authHeader.substring(7);

        // Verify token
        let decoded;
        try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
        // Token không hợp lệ hoặc đã hết hạn
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
            status: "error",
            code: 401,
            message: "Token đã hết hạn",
            });
        }

        return res.status(401).json({
            status: "error",
            code: 401,
            message: "Token không hợp lệ",
        });
        }

        // Tìm user trong database
        const user = await User.findById(decoded.sub);

        if (!user) {
        return res.status(401).json({
            status: "error",
            code: 401,
            message: "Unauthorized - Người dùng không tồn tại",
        });
        }

        // Kiểm tra trạng thái user
        if (user.status === "locked") {
        return res.status(403).json({
            status: "error",
            code: 403,
            message: "Tài khoản đã bị khóa",
        });
        }

        // Gắn thông tin user vào request
        req.user = {
            id: user._id,
            role: user.role,
            email: user.email,
        };

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
        status: "error",
        code: 500,
        message: "Lỗi server khi xác thực",
        });
    }
    };

    /**
     * Middleware Factory
     * Hàm trả về Middleware phân quyền (Authorization)
     * Kiểm tra vai trò của user có nằm trong danh sách cho phép hay không
     * Middleware này phải được dùng sau checkAuth
     *
     * param {Array<string>} roles - Mảng các vai trò được phép (vd: ['Admin', 'Moderator'])
     * returns {Function} Middleware function
     *
     * router.post('/admin/categories', checkAuth, checkRole(['Admin']), createCategory)
     */
    const checkRole = (roles) => {
    // Factory function - trả về middleware
    return (req, res, next) => {
        // Kiểm tra xem req.user có tồn tại không (checkAuth phải chạy trước)
        if (!req.user || !req.user.role) {
        return res.status(401).json({
            status: "error",
            code: 401,
            message: "Unauthorized - Vui lòng đăng nhập",
        });
        }

        // Kiểm tra role của user có nằm trong mảng roles cho phép không
        if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            status: "error",
            code: 403,
            message: "Bạn không có quyền thực hiện thao tác này",
        });
        }

        // User có quyền - tiếp tục
        next();
    };
};

module.exports = {
    checkAuth,
    checkRole,
};
