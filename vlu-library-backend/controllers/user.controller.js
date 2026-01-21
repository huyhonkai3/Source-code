const User = require("../models/user.model");
const UpgradeRequest = require("../models/upgradeRequest.model");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
// Import helper functions từ upload middleware
const {
  getAvatarUrl,
  deleteFile,
  STORAGE_MODE,
} = require("../middleware/upload.middleware");

/**  API 1.9 – Lấy thông tin cá nhân
 * @route GET /api/users/profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Promise<void>}
 */
exports.getProfile = async (req, res) => {
  try {
    // req.user.id được lấy từ middleware checkAuth
    const user = await User.findById(req.user.id).select(
      "-password -passwordHash",
    );

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy người dùng" });
    }

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/** API 1.4 – Cập nhật thông tin cá nhân
 * @route PUT /api/users/profile
 * @param {string} name - Tên người dùng
 * @param {string} phoneNumber - Số điện thoại người dùng
 * @param {string} address - Địa chỉ người dùng
 * @param {string} avatar - Avatar người dùng
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy ID từ token

    // Chỉ lấy những trường cho phép cập nhật
    const { name, phoneNumber, address, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        phoneNumber,
        address,
        avatar,
      },
      { new: true, runValidators: true },
    ).select("-password -passwordHash");

    res.json({
      status: "success",
      message: "Cập nhật thông tin thành công",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/** API - Upload Avatar
 * @route POST /api/users/avatar
 * @description Upload và cập nhật ảnh đại diện
 */
exports.uploadAvatar = async (req, res) => {
  try {
    // Kiểm tra file đã được upload chưa
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Vui lòng chọn ảnh để upload",
      });
    }

    const userId = req.user.id;

    // Lấy thông tin user hiện tại
    const currentUser = await User.findById(userId);

    // Xóa avatar cũ nếu tồn tại (S3 hoặc Local)
    if (currentUser?.avatarUrl) {
      await deleteFile(currentUser.avatarUrl);
    }

    // Tạo URL cho avatar mới (S3 hoặc Local)
    const avatarUrl = getAvatarUrl(req.file);

    // Cập nhật avatarUrl trong database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarUrl: avatarUrl },
      { new: true, runValidators: true },
    ).select("-password -passwordHash");

    if (!updatedUser) {
      await deleteFile(getAvatarUrl(req.file));
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy người dùng",
      });
    }

    // Trả về kết quả thành công
    res.json({
      status: "success",
      message: "Cập nhật ảnh đại diện thành công",
      data: {
        avatarUrl: updatedUser.avatarUrl,
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);

    // Xóa file đã upload nếu có lỗi (S3 hoặc Local)
    if (req.file) {
      await deleteFile(getAvatarUrl(req.file));
    }

    res.status(500).json({
      status: "error",
      message: error.message || "Lỗi khi upload ảnh đại diện",
    });
  }
};

/** API 1.5 – Đổi mật khẩu
 * @route PUT /api/users/change-password
 * @param {string} currentPassword - Mật khẩu hiện tại
 * @param {string} newPassword - Mật khẩu mới
 * @param {string} confirmPassword - Mật khẩu xác nhận
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    // Validation cơ bản
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ status: "error", message: "Vui lòng nhập đầy đủ thông tin" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ status: "error", message: "Mật khẩu xác nhận không khớp" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Mật khẩu mới phải có ít nhất 6 ký tự",
      });
    }

    // Tìm user
    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ status: "error", message: "Người dùng không tồn tại" });

    // Kiểm tra mật khẩu cũ
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ status: "error", message: "Mật khẩu hiện tại không đúng" });
    }

    // Cập nhật mật khẩu mới (User Model sẽ tự hash)
    user.passwordHash = newPassword;
    await user.save();

    res.json({
      status: "success",
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

/** API - Yêu cầu nâng cấp lên Author
 * @route POST /api/users/upgrade-request
 * @param {string} reason - Lý do muốn trở thành Author
 */
exports.requestUpgrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reason } = req.body;

    // Validation
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        status: "error",
        message: "Lý do phải có ít nhất 10 ký tự",
      });
    }

    // Check user đã là Author chưa
    const user = await User.findById(userId);
    if (user.role === "Author") {
      return res.status(400).json({
        status: "error",
        message: "Bạn đã là Tác giả rồi",
      });
    }

    // Check xem có request nào đang pending không
    const existingRequest = await UpgradeRequest.findOne({
      userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        status: "error",
        message:
          "Bạn đã có yêu cầu đang chờ duyệt. Vui lòng đợi Admin xét duyệt.",
      });
    }

    // Tạo request mới
    const newRequest = await UpgradeRequest.create({
      userId,
      reason: reason.trim(),
    });

    res.status(201).json({
      status: "success",
      message: "Gửi yêu cầu thành công. Admin sẽ xem xét trong vòng 24-48 giờ.",
      data: newRequest,
    });
  } catch (error) {
    console.error("Request upgrade error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/** API - Lấy trạng thái yêu cầu nâng cấp
 * @route GET /api/users/upgrade-request/status
 */
exports.getMyRequestStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm request mới nhất của user
    const request = await UpgradeRequest.findOne({ userId })
      .sort({ createdAt: -1 })
      .select("status reason rejectionReason createdAt reviewedAt");

    // Nếu không có request nào
    if (!request) {
      return res.json({
        status: "success",
        data: null,
      });
    }

    res.json({
      status: "success",
      data: request,
    });
  } catch (error) {
    console.error("Get request status error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
