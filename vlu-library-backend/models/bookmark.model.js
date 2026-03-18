const mongoose = require("mongoose");

/**
 * Bookmark Model - Lưu vị trí đọc tài liệu
 * Mỗi user chỉ có 1 bookmark duy nhất cho mỗi tài liệu (upsert pattern).
 * position: String để tương thích cả PDF (số trang) và EPUB (epubcfi string)
 */
const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    // PDF: "15" (số trang), EPUB: "epubcfi(/6/2[chap01]!/4/2/1:0)"
    position: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index: mỗi user chỉ có 1 bookmark/tài liệu
bookmarkSchema.index({ user: 1, document: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
