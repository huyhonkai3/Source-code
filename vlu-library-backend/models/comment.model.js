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
    // ParentId cho nested comments (2 cấp)
    // null = comment gốc (Level 1)
    // ObjectId = reply của comment đó (Level 2)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
      index: true, // Index để query replies nhanh hơn
    },
    content: {
      type: String,
      required: [true, "Nội dung bình luận là bắt buộc"],
      maxlength: [500, "Nội dung không được quá 500 ký tự"],
      trim: true,
    },
    // Mảng chứa userId đã like comment này
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
    // Virtual field để lấy số lượng likes
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual field: likeCount
commentSchema.virtual("likeCount").get(function () {
  return this.likes ? this.likes.length : 0;
});

// Virtual field: replyCount (đếm số replies)
commentSchema.virtual("replyCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
  count: true,
});

// Compound index để tối ưu query comments theo docId và parentId
commentSchema.index({ docId: 1, parentId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", commentSchema);
