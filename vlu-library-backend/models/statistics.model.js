const mongoose = require("mongoose");

/**
 * Statistic Schema
 * Lưu trữ thống kê lượt xem và tải xuống tài liệu
 *
 * Business Logic:
 * - Mỗi user chỉ được track 1 lần cho mỗi loại hành động (view/download) trên 1 tài liệu trong 1 ngày
 * - Sử dụng compound unique index để chống spam
 * - date chỉ lưu ngày (00:00:00) để dễ dàng query và enforce unique constraint
 */

const statisticSchema = new mongoose.Schema(
  {
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "ID tài liệu là bắt buộc"],
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "ID người dùng là bắt buộc"],
      index: true,
    },

    type: {
      type: String,
      enum: {
        values: ["view", "download"],
        message: "Loại hành động không hợp lệ",
      },
      required: [true, "Loại hành động là bắt buộc"],
    },

    // Chỉ lưu ngày (YYYY-MM-DD 00:00:00), không lưu giờ/phút/giây
    date: {
      type: Date,
      required: [true, "Ngày là bắt buộc"],
    },

    // Timestamp chính xác khi hành động xảy ra (dùng để phân tích chi tiết)
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // Không cần createdAt/updatedAt vì đã có timestamp
  }
);

/**
 * CRITICAL: Compound unique index để chống spam
 *
 * Đảm bảo 1 user chỉ có thể:
 * - Xem 1 tài liệu 1 lần/ngày
 * - Tải 1 tài liệu 1 lần/ngày
 *
 * Ví dụ:
 * - User A xem doc 123 lúc 8h sáng ngày 12/11 -> OK, lưu vào DB
 * - User A xem doc 123 lúc 3h chiều ngày 12/11 -> REJECTED (duplicate)
 * - User A xem doc 123 lúc 8h sáng ngày 13/11 -> OK (ngày khác)
 * - User A tải doc 123 lúc 9h sáng ngày 12/11 -> OK (type khác)
 */
statisticSchema.index(
  { docId: 1, userId: 1, type: 1, date: 1 },
  { unique: true }
);

/**
 * Static Method: Ghi nhận hành động và cập nhật counter trong document
 *
 * param {ObjectId} docId - ID tài liệu
 * param {ObjectId} userId - ID người dùng
 * param {String} type - 'view' hoặc 'download'
 * returns {Object} - { success: boolean, message: string, isFirstTime: boolean }
 */
statisticSchema.statics.trackAction = async function (docId, userId, type) {
  try {
    // Lấy ngày hiện tại (reset về 00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Thử tạo record mới
    const newStat = new this({
      docId,
      userId,
      type,
      date: today,
    });

    await newStat.save();

    // Nếu save thành công -> đây là lần đầu tiên trong ngày
    // Cập nhật counter trong document
    const Document = mongoose.model("Document");
    const updateField = type === "view" ? "views" : "downloads";

    await Document.updateOne({ _id: docId }, { $inc: { [updateField]: 1 } });

    return {
      success: true,
      message: "Ghi nhận thành công",
      isFirstTime: true,
    };
  } catch (error) {
    // Nếu lỗi duplicate key (code 11000) -> user đã thực hiện hành động này hôm nay
    if (error.code === 11000) {
      return {
        success: true,
        message: "Đã ghi nhận trước đó",
        isFirstTime: false,
      };
    }

    // Lỗi khác -> throw để controller xử lý
    throw error;
  }
};

/**
 * Static Method: Lấy top N tài liệu được xem nhiều nhất
 *
 * param {Number} limit - Số lượng tài liệu muốn lấy
 * param {Number} days - Số ngày gần đây (mặc định: 30 ngày)
 * returns {Array} - Danh sách tài liệu với số lượt xem
 */
statisticSchema.statics.getTopViewedDocuments = async function (
  limit = 10,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return await this.aggregate([
    {
      $match: {
        type: "view",
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$docId",
        totalViews: { $sum: 1 },
      },
    },
    {
      $sort: { totalViews: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "documents",
        localField: "_id",
        foreignField: "_id",
        as: "document",
      },
    },
    {
      $unwind: "$document",
    },
    {
      $project: {
        _id: 0,
        docId: "$_id",
        totalViews: 1,
        title: "$document.title",
        author: "$document.author",
        categoryId: "$document.categoryId",
      },
    },
  ]);
};

/**
 * Static Method: Lấy top N tài liệu được tải nhiều nhất
 */
statisticSchema.statics.getTopDownloadedDocuments = async function (
  limit = 10,
  days = 30
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  return await this.aggregate([
    {
      $match: {
        type: "download",
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: "$docId",
        totalDownloads: { $sum: 1 },
      },
    },
    {
      $sort: { totalDownloads: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "documents",
        localField: "_id",
        foreignField: "_id",
        as: "document",
      },
    },
    {
      $unwind: "$document",
    },
    {
      $project: {
        _id: 0,
        docId: "$_id",
        totalDownloads: 1,
        title: "$document.title",
        author: "$document.author",
        categoryId: "$document.categoryId",
      },
    },
  ]);
};

const Statistic = mongoose.model("Statistic", statisticSchema);

module.exports = Statistic;
