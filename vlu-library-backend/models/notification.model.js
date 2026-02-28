const mongoose = require("mongoose");

/**
 * Notification Schema v2.0
 * Lưu thông báo cho từng user về:
 * - Kết quả duyệt yêu cầu nâng cấp quyền (UPGRADE_REQUEST)
 * - Kết quả duyệt tài liệu (DOCUMENT_MODERATION)
 */
const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["UPGRADE_REQUEST", "DOCUMENT_MODERATION"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      default: null,
    },
    // Lưu ID Admin/Moderator đã thực hiện hành động
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
