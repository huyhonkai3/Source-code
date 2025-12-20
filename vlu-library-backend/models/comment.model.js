const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "ID tài liệu là bắt buộc"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người bình luận là bắt buộc"],
    },
    content: {
      type: String,
      required: [true, "Nội dung bình luận là bắt buộc"],
      maxlength: [500, "Nội dung không được quá 500 ký tự"],
      trim: true,
    },
    // Dùng cho admin khi xóa bình luận vi phạm
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deleteReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Comment", commentSchema);
