const mongoose = require("mongoose");

/**
 * UpgradeRequest Schema
 * Lưu trữ các yêu cầu nâng cấp từ User lên Author
 */
const upgradeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
      index: true,
    },

    reason: {
      type: String,
      required: [true, "Lý do yêu cầu là bắt buộc"],
      minlength: [10, "Lý do phải có ít nhất 10 ký tự"],
      maxlength: [1000, "Lý do không được vượt quá 1000 ký tự"],
      trim: true,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Trạng thái không hợp lệ",
      },
      default: "pending",
      index: true,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    rejectionReason: {
      type: String,
      default: null,
      maxlength: [500, "Lý do từ chối không được vượt quá 500 ký tự"],
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

/**
 * Indexes
 * - userId + status: Tìm request của user theo status
 * - status: Lọc request theo trạng thái
 */
upgradeRequestSchema.index({ userId: 1, status: 1 });
upgradeRequestSchema.index({ createdAt: -1 });

/**
 * Instance Method: Chuyển đổi object sang JSON response
 */
upgradeRequestSchema.methods.toJSON = function () {
  const request = this.toObject();

  // Đổi _id thành id
  request.id = request._id;
  delete request._id;
  delete request.__v;

  return request;
};

const UpgradeRequest = mongoose.model("UpgradeRequest", upgradeRequestSchema);

module.exports = UpgradeRequest;
