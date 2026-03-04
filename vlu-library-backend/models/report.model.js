const mongoose = require("mongoose");

/**
 * Report Schema - Notice & Takedown System
 * Lưu trữ các báo cáo vi phạm bản quyền / nội dung của tài liệu
 *
 * Workflow:
 * 1. User báo cáo tài liệu → tạo Report (status: PENDING), tài liệu bị HIDDEN
 * 2. Admin xem xét → RESOLVED (xóa tài liệu) hoặc REJECTED (bác bỏ, tài liệu về approved)
 */
const reportSchema = new mongoose.Schema(
  {
    /**
     * Tài liệu bị báo cáo
     */
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Tài liệu bị báo cáo là bắt buộc"],
    },

    /**
     * Người gửi báo cáo
     */
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người báo cáo là bắt buộc"],
    },

    /**
     * Lý do báo cáo
     */
    reason: {
      type: String,
      enum: {
        values: [
          "COPYRIGHT_INFRINGEMENT", // Vi phạm bản quyền
          "INAPPROPRIATE_CONTENT", // Nội dung không phù hợp
          "WRONG_CATEGORY", // Sai danh mục
          "SPAM", // Spam / trùng lặp
          "OTHER", // Lý do khác
        ],
        message: "Lý do báo cáo không hợp lệ",
      },
      required: [true, "Lý do báo cáo là bắt buộc"],
    },

    /**
     * Mô tả chi tiết từ người báo cáo
     */
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Mô tả không được vượt quá 1000 ký tự"],
      default: "",
    },

    /**
     * Trạng thái xử lý báo cáo
     * PENDING: Chưa xử lý (tài liệu đang HIDDEN)
     * RESOLVED: Đã xử lý - tài liệu vi phạm, đã xóa hoặc giữ ẩn
     * REJECTED: Bác bỏ báo cáo - tài liệu được khôi phục về approved
     */
    status: {
      type: String,
      enum: {
        values: ["PENDING", "RESOLVED", "REJECTED"],
        message: "Trạng thái không hợp lệ",
      },
      default: "PENDING",
    },

    /**
     * Admin xử lý báo cáo
     */
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /**
     * Thời điểm Admin xử lý
     */
    resolvedAt: {
      type: Date,
      default: null,
    },

    /**
     * Ghi chú của Admin khi xử lý
     */
    adminNote: {
      type: String,
      trim: true,
      maxlength: [500, "Ghi chú không được vượt quá 500 ký tự"],
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// ==================== INDEXES ====================
reportSchema.index({ document: 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ document: 1, reporter: 1 }); // Kiểm tra duplicate report

// ==================== LABEL MAPPING ====================

reportSchema.statics.REASON_LABELS = {
  COPYRIGHT_INFRINGEMENT: "Vi phạm bản quyền",
  INAPPROPRIATE_CONTENT: "Nội dung không phù hợp",
  WRONG_CATEGORY: "Sai danh mục",
  SPAM: "Spam / Trùng lặp",
  OTHER: "Lý do khác",
};

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
