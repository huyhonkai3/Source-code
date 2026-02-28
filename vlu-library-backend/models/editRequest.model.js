const mongoose = require("mongoose");

/**
 * EditRequest Model
 * Lưu trữ yêu cầu chỉnh sửa tài liệu đã xuất bản từ Author
 */
const editRequestSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: [true, "Lý do xin chỉnh sửa là bắt buộc"],
      trim: true,
      maxlength: [500, "Lý do không được vượt quá 500 ký tự"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminReason: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

editRequestSchema.index({ document: 1, author: 1 });
editRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("EditRequest", editRequestSchema);
