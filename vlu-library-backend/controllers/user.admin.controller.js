const User = require("../models/user.model");
const UpgradeRequest = require("../models/upgradeRequest.model");
const Notification = require("../models/notification.model");

/** 1.6 Lấy danh sách người dùng
 * @route GET /api/admin/users
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng người dùng trên mỗi trang
 */
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { role, status, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password -passwordHash")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách người dùng thành công",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit,
        },
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", code: 500, message: error.message });
  }
};

/** 1.7 Thay đổi vai trò
 * @route PUT /api/users/:id/role
 * @param {string} id - ID của người dùng
 * @param {string} newRole - Vai trò mới
 * @returns {Promise<Object>} - Thông tin người dùng sau khi cập nhật vai trò
 */
exports.changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { newRole } = req.body;

    if (!["User", "Author", "Moderator", "Admin"].includes(newRole)) {
      return res
        .status(400)
        .json({ status: "error", code: 400, message: "Vai trò không hợp lệ" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true },
    ).select("-password -passwordHash");
    if (!user)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy người dùng",
      });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Cập nhật vai trò thành công",
      data: { user },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", code: 500, message: error.message });
  }
};

/** 1.8 Khóa/Mở khóa tài khoản
 * @route PUT /api/admin/users/:id/status
 * @param {string} id - ID của người dùng
 * @param {string} status - Trạng thái mới (active/locked)
 * @param {string} reason - Lý do khóa (nếu có)
 * @returns {Promise<void>}
 */
exports.changeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!["active", "locked"].includes(status)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Trạng thái không hợp lệ",
      });
    }

    if (status === "locked" && !reason) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Cần cung cấp lý do khóa",
      });
    }

    const updateData = { status };
    if (status === "locked") {
      updateData.lockReason = reason;
    } else {
      updateData.lockReason = null; // Xóa lý do nếu mở khóa
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password -passwordHash");
    if (!user)
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy người dùng",
      });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Cập nhật trạng thái tài khoản thành công",
      data: { user },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", code: 500, message: error.message });
  }
};

/** API - Lấy danh sách yêu cầu nâng cấp Author
 * @route GET /api/admin/upgrade-requests
 * @param {string} status - Filter theo status (pending/approved/rejected)
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng request trên mỗi trang
 * @returns {Promise<Object>} - Danh sách upgrade requests
 */
exports.getUpgradeRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status } = req.query;

    // Build query
    const query = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    // Count total
    const totalRequests = await UpgradeRequest.countDocuments(query);

    // Fetch requests với populate user info
    const requests = await UpgradeRequest.find(query)
      .populate("userId", "name email avatarUrl")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách yêu cầu nâng cấp thành công",
      data: {
        requests,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRequests / limit),
          totalRequests,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get upgrade requests error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: error.message,
    });
  }
};

/** API - Xét duyệt yêu cầu nâng cấp Author
 * @route PUT /api/admin/upgrade-requests/:id/review
 * @param {string} id - ID của upgrade request
 * @param {string} status - Trạng thái mới (approved/rejected)
 * @param {string} rejectionReason - Lý do từ chối (nếu reject)
 * @returns {Promise<Object>} - Kết quả xét duyệt
 */
exports.reviewUpgradeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const adminId = req.user.id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message:
          "Trạng thái không hợp lệ. Chỉ chấp nhận 'approved' hoặc 'rejected'",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Cần cung cấp lý do từ chối",
      });
    }

    const request = await UpgradeRequest.findById(id).populate(
      "userId",
      "name email role",
    );

    if (!request) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy yêu cầu nâng cấp",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: `Yêu cầu này đã được ${request.status === "approved" ? "chấp thuận" : "từ chối"} trước đó`,
      });
    }

    if (request.userId.role === "Author") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Người dùng đã là Author rồi",
      });
    }

    request.status = status;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    if (status === "rejected") {
      request.rejectionReason = rejectionReason;
    }

    await request.save();

    if (status === "approved") {
      await User.findByIdAndUpdate(request.userId._id, {
        role: "Author",
      });
    }

    // ====== TRIGGER NOTIFICATION ======
    try {
      const notificationData = {
        recipient: request.userId._id,
        type: "UPGRADE_REQUEST",
      };

      if (status === "approved") {
        notificationData.title = "Yêu cầu nâng cấp được chấp thuận 🎉";
        notificationData.message =
          "Chúc mừng! Yêu cầu nâng cấp lên quyền Tác giả (Author) của bạn đã được chấp thuận. Bạn có thể tải lên tài liệu ngay bây giờ.";
      } else {
        notificationData.title = "Yêu cầu nâng cấp bị từ chối";
        notificationData.message = `Yêu cầu nâng cấp lên quyền Tác giả của bạn đã bị từ chối. Lý do: ${rejectionReason}`;
      }

      await Notification.create(notificationData);
    } catch (notifError) {
      console.error(
        "[Notification] Failed to create notification:",
        notifError,
      );
    }
    // ====== END TRIGGER ======

    await request.populate("reviewedBy", "name email");

    res.status(200).json({
      status: "success",
      code: 200,
      message:
        status === "approved"
          ? "Đã chấp thuận yêu cầu. Người dùng đã được nâng cấp lên Author."
          : "Đã từ chối yêu cầu",
      data: { request },
    });
  } catch (error) {
    console.error("Review upgrade request error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: error.message,
    });
  }
};
