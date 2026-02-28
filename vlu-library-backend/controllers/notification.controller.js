const Notification = require("../models/notification.model");

/**
 * Lấy danh sách thông báo của user đang đăng nhập
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("relatedDocument", "title")
        .populate("actionBy", "name email avatarUrl"), // Populate người thực hiện
      Notification.countDocuments({ recipient: userId }),
    ]);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách thông báo thành công",
      data: {
        notifications: notifications.map((n) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          relatedDocument: n.relatedDocument
            ? {
                id: n.relatedDocument._id,
                title: n.relatedDocument.title,
              }
            : null,
          // Trả về thông tin người thực hiện
          actionBy: n.actionBy
            ? {
                id: n.actionBy._id,
                name: n.actionBy.name,
                email: n.actionBy.email,
                avatarUrl: n.actionBy.avatarUrl || null,
              }
            : null,
          createdAt: n.createdAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy thông báo",
    });
  }
};

/**
 * Đếm số thông báo chưa đọc
 * GET /api/notifications/unread-count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy số thông báo chưa đọc thành công",
      data: { count },
    });
  } catch (error) {
    console.error("getUnreadCount error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server",
    });
  }
};

/**
 * Đánh dấu 1 thông báo là đã đọc
 * PUT /api/notifications/:id/read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy thông báo",
      });
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Đã đánh dấu đã đọc",
      data: { id: notification._id, isRead: notification.isRead },
    });
  } catch (error) {
    console.error("markAsRead error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server",
    });
  }
};

/**
 * Đánh dấu tất cả thông báo của user là đã đọc
 * PUT /api/notifications/read-all
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true },
    );

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Đã đánh dấu tất cả là đã đọc",
      data: { updatedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
