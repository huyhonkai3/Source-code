const jwt = require("jsonwebtoken");
const axios = require("axios"); // THÊM: Import axios cho Microsoft Graph API
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");

/**
 * API 1.1: Đăng ký tài khoản (F1)
 * POST /api/auth/register
 *
 * MVP Note: Mock email activation - tài khoản tự động active ngay khi đăng ký
 */
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation: Kiểm tra các trường bắt buộc
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu đăng ký không hợp lệ",
        errors: [
          {
            field: "all",
            message: "Vui lòng điền đầy đủ thông tin",
          },
        ],
      });
    }

    // Validation: Kiểm tra password === confirmPassword
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu đăng ký không hợp lệ",
        errors: [
          {
            field: "confirmPassword",
            message: "Mật khẩu xác nhận không khớp",
          },
        ],
      });
    }

    // Validation: Kiểm tra email phải có đuôi @vanlanguni.vn
    if (!email.endsWith("@vanlanguni.vn")) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu đăng ký không hợp lệ",
        errors: [
          {
            field: "email",
            message: "Email phải có đuôi @vanlanguni.vn",
          },
        ],
      });
    }

    // Validation: Kiểm tra độ dài và độ phức tạp của password
    if (password.length < 8) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu đăng ký không hợp lệ",
        errors: [
          {
            field: "password",
            message: "Mật khẩu phải có ít nhất 8 ký tự",
          },
        ],
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Email đã được sử dụng",
        errors: [
          {
            field: "email",
            message: "Email này đã được đăng ký trước đó",
          },
        ],
      });
    }

    // Tạo user mới
    // MVP: status = 'active' (tự động kích hoạt, không cần email)
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password, // Pre-save hook sẽ tự động hash
      status: "active", // MVP: Tự động active
      role: "User",
    });

    await newUser.save();

    // Trả về response thành công
    // MVP: KHÔNG gửi email kích hoạt
    return res.status(201).json({
      status: "success",
      code: 201,
      message: "Đăng ký thành công. Tài khoản đã được kích hoạt.",
      data: {
        userId: newUser._id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    // Xử lý lỗi validation của Mongoose
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }));

      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu đăng ký không hợp lệ",
        errors,
      });
    }

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi đăng ký tài khoản",
    });
  }
};

/**
 * API 1.2: Đăng nhập (F2)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation: Kiểm tra các trường bắt buộc
    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Vui lòng cung cấp email và mật khẩu",
      });
    }

    // Tìm user bằng email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Nếu không tìm thấy user
    if (!user) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }

    // Kiểm tra trạng thái user
    if (user.status === "locked") {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Tài khoản đã bị khóa",
        data: {
          lockReason: user.lockReason,
        },
      });
    }

    // So sánh password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }

    // Tạo Access Token (JWT, expires: 1h)
    const accessToken = jwt.sign(
      {
        sub: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h" },
    );

    // Tạo Refresh Token (JWT, expires: 7d)
    const refreshToken = jwt.sign(
      {
        sub: user._id,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
    );

    // Lưu Refresh Token vào database
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7); // 7 ngày

    await RefreshToken.createToken(
      user._id,
      refreshToken,
      refreshTokenExpiresAt,
      {
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
      },
    );

    // Trả về response thành công
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi đăng nhập",
    });
  }
};

/**
 * API 1.3: Đăng xuất (delete all refresh tokens for current user)
 * POST /api/auth/logout
 * Access: Authenticated user
 */
const logout = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ status: "error", code: 401, message: "Unauthorized" });
    }

    const userId = req.user.id;
    const deletedCount = await RefreshToken.deleteAllUserTokens(userId);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Đăng xuất thành công",
      data: { deletedCount },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi đăng xuất",
    });
  }
};

/**
 * API 1.5: Đổi mật khẩu
 * PUT /api/auth/change-password
 * Access: Authenticated
 * Body: { currentPassword, newPassword }
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Lấy từ middleware checkAuth

    // Validation: Kiểm tra các trường bắt buộc
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Vui lòng cung cấp đầy đủ thông tin",
        errors: [
          {
            field: "all",
            message: "Mật khẩu hiện tại và mật khẩu mới là bắt buộc",
          },
        ],
      });
    }

    // Validation: Kiểm tra độ dài mật khẩu mới
    if (newPassword.length < 8) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Mật khẩu mới không hợp lệ",
        errors: [
          {
            field: "newPassword",
            message: "Mật khẩu mới phải có ít nhất 8 ký tự",
          },
        ],
      });
    }

    // Tìm user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Mật khẩu hiện tại không chính xác",
        errors: [
          {
            field: "currentPassword",
            message: "Mật khẩu hiện tại không chính xác",
          },
        ],
      });
    }

    // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Mật khẩu mới phải khác mật khẩu hiện tại",
        errors: [
          {
            field: "newPassword",
            message: "Mật khẩu mới phải khác mật khẩu hiện tại",
          },
        ],
      });
    }

    // Cập nhật mật khẩu mới
    user.passwordHash = newPassword; // Pre-save hook sẽ tự động hash
    await user.save();

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi đổi mật khẩu",
    });
  }
};

/**
 * API 1.9: Lấy thông tin người dùng hiện tại
 * GET /api/auth/me
 * Access: Authenticated
 * => không sử dụng
 */
const me = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ status: "error", code: 401, message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy thông tin người dùng thành công",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
          status: user.status,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy thông tin người dùng",
    });
  }
};

/**
 * API 1.10: Làm mới Access Token
 * POST /api/auth/refresh
 *
 * Token Rotation: Tạo cả accessToken VÀ refreshToken mới, xóa refreshToken cũ
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Validation: Kiểm tra refreshToken có được cung cấp không
    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Refresh token là bắt buộc",
      });
    }

    // Verify refreshToken
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      // Token không hợp lệ hoặc đã hết hạn
      return res.status(401).json({
        status: "error",
        code: 401,
        message:
          "Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      });
    }

    // Tìm token trong database và kiểm tra isRevoked
    const tokenDoc = await RefreshToken.findValidToken(refreshToken);

    if (!tokenDoc) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Refresh token đã bị thu hồi",
      });
    }

    // Tìm user
    const user = await User.findById(decoded.sub);

    if (!user) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy người dùng",
      });
    }

    // Kiểm tra user có bị khóa không
    if (user.status === "locked") {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Tài khoản đã bị khóa",
      });
    }

    // Token Rotation: Tạo Access Token MỚI
    const newAccessToken = jwt.sign(
      {
        sub: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h" },
    );

    // Token Rotation: Tạo Refresh Token MỚI
    const newRefreshToken = jwt.sign(
      {
        sub: user._id,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
    );

    // Lưu Refresh Token MỚI vào database
    const newRefreshTokenExpiresAt = new Date();
    newRefreshTokenExpiresAt.setDate(newRefreshTokenExpiresAt.getDate() + 7);

    await RefreshToken.createToken(
      user._id,
      newRefreshToken,
      newRefreshTokenExpiresAt,
      {
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
      },
    );

    // Token Rotation: Xóa Refresh Token CŨ khỏi database
    await RefreshToken.deleteToken(refreshToken);

    // Trả về response thành công với tokens MỚI
    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Làm mới token thành công",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi làm mới token",
    });
  }
};

/**
 * API 1.12: Thu hồi refresh token
 * POST /api/auth/logout/revoke
 * Body: { refreshToken }
 * Access: Public (token string required)
 */
const revoke = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Refresh token là bắt buộc",
      });
    }

    const deleted = await RefreshToken.deleteToken(refreshToken);
    if (deleted) {
      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Refresh token đã bị thu hồi",
      });
    }

    // Nếu không tìm thấy token, trả về 404
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "Không tìm thấy refresh token",
    });
  } catch (error) {
    console.error("Revoke token error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi thu hồi token",
    });
  }
};

/**
 * API: Đăng nhập bằng Microsoft
 * POST /api/auth/microsoft-login
 * Body: { accessToken } - Access token từ MSAL (frontend)
 *
 * Flow:
 * 1. Frontend dùng MSAL để login Microsoft, nhận được accessToken
 * 2. Frontend gửi accessToken xuống backend
 * 3. Backend verify token bằng cách gọi Microsoft Graph API
 * 4. Nếu hợp lệ -> tạo/cập nhật user -> trả về JWT của hệ thống
 */
const loginWithMicrosoft = async (req, res) => {
  try {
    const { accessToken } = req.body;

    // Validation
    if (!accessToken) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Access Token là bắt buộc",
      });
    }

    // 1. Gọi Microsoft Graph API để lấy thông tin user từ token
    // Bước này giúp xác thực token là thật, do Microsoft cấp
    let msUser;
    try {
      const msResponse = await axios.get(
        "https://graph.microsoft.com/v1.0/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      msUser = msResponse.data;
    } catch (msError) {
      console.error(
        "Microsoft Graph API Error:",
        msError.response?.data || msError.message,
      );
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Token Microsoft không hợp lệ hoặc đã hết hạn",
      });
    }

    // msUser sẽ có: { id, displayName, mail, userPrincipalName, ... }
    const email = (msUser.mail || msUser.userPrincipalName || "").toLowerCase();

    if (!email) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Không thể lấy email từ tài khoản Microsoft",
      });
    }

    // 2. Kiểm tra domain email (Backend validation - bắt buộc)
    if (!email.endsWith("@vanlanguni.vn") && !email.endsWith("@vlu.edu.vn")) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message:
          "Chỉ chấp nhận email @vanlanguni.vn hoặc @vlu.edu.vn của trường Đại học Văn Lang",
      });
    }

    // 3. Tìm user trong DB
    let user = await User.findOne({ email: email });
    let isNewUser = false;

    if (!user) {
      // 4a. Nếu chưa có -> Tự động đăng ký (Register)
      isNewUser = true;
      user = new User({
        name: msUser.displayName || email.split("@")[0], // Dùng đúng field 'name' như model
        email: email,
        passwordHash: null, // Không cần password vì login qua Microsoft
        status: "active",
        role: "User", // Mặc định là User
        authProvider: "microsoft", // Đánh dấu user này login qua MS
        microsoftId: msUser.id, // Lưu Microsoft ID để tracking
        avatarUrl: null,
      });
      await user.save();
      console.log(`[Microsoft Login] New user created: ${email}`);
    } else {
      // 4b. Nếu user đã tồn tại
      // Cập nhật microsoftId nếu chưa có (link account)
      if (!user.microsoftId) {
        user.microsoftId = msUser.id;
        user.authProvider = user.authProvider || "microsoft";
        await user.save();
        console.log(`[Microsoft Login] Linked Microsoft account: ${email}`);
      }

      // Kiểm tra trạng thái user
      if (user.status === "locked") {
        return res.status(403).json({
          status: "error",
          code: 403,
          message: "Tài khoản đã bị khóa",
          data: {
            lockReason: user.lockReason,
          },
        });
      }
    }

    // 5. Tạo JWT Token của hệ thống VLU Library
    const jwtAccessToken = jwt.sign(
      {
        sub: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1h" },
    );

    // 6. Tạo Refresh Token
    const jwtRefreshToken = jwt.sign(
      {
        sub: user._id,
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" },
    );

    // 7. Lưu Refresh Token vào database
    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    await RefreshToken.createToken(
      user._id,
      jwtRefreshToken,
      refreshTokenExpiresAt,
      {
        deviceInfo: req.headers["user-agent"],
        ipAddress: req.ip || req.connection.remoteAddress,
        loginMethod: "microsoft",
      },
    );

    // 8. Trả về response (format giống login thường để frontend xử lý thống nhất)
    return res.status(200).json({
      status: "success",
      code: 200,
      message: isNewUser
        ? "Đăng ký và đăng nhập thành công qua Microsoft"
        : "Đăng nhập thành công qua Microsoft",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        accessToken: jwtAccessToken,
        refreshToken: jwtRefreshToken,
      },
    });
  } catch (error) {
    console.error(
      "Microsoft Login Error:",
      error.response?.data || error.message,
    );
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi đăng nhập bằng Microsoft",
    });
  }
};

// Export tất cả functions
module.exports = {
  register,
  login,
  changePassword,
  refresh,
  me,
  logout,
  revoke,
  loginWithMicrosoft,
};
