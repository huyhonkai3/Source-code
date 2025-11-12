const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

/**
 * checkAuthOptional Middleware
 * Parse JWT token nếu có, nhưng KHÔNG bắt buộc
 * Dùng cho các route cần biết user là ai (nếu đăng nhập) nhưng vẫn cho phép anonymous
 *
 * Ví dụ: API get document by ID
 * - Tài liệu approved: Public - ai cũng xem được
 * - Tài liệu pending/rejected: Chỉ Admin, Moderator, hoặc owner xem được
 *
 * Middleware này sẽ parse JWT và gắn vào req.user nếu token hợp lệ
 * Nếu không có token hoặc token không hợp lệ, req.user = null và KHÔNG trả về lỗi
 */
const checkAuthOptional = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Không có token - OK, tiếp tục với req.user = null
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7); // Bỏ "Bearer "

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm user
    const user = await User.findById(decoded.sub).select(
      "_id name email role status"
    );

    if (!user) {
      // User không tồn tại - OK, tiếp tục với req.user = null
      req.user = null;
      return next();
    }

    if (user.status === "locked") {
      // User bị khóa - OK, tiếp tục với req.user = null
      req.user = null;
      return next();
    }

    // Gắn user info vào request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    // Token không hợp lệ hoặc hết hạn - OK, tiếp tục với req.user = null
    req.user = null;
    next();
  }
};

module.exports = {
  checkAuthOptional,
};
