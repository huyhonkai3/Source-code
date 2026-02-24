const mongoose = require("mongoose");

/**
 * Document Schema
 * Lưu trữ thông tin tài liệu được upload lên hệ thống
 *
 * Business Logic:
 * - Tài liệu phải qua kiểm duyệt (status: pending -> approved/rejected)
 * - Hỗ trợ tracking views và downloads
 * - Tích hợp thông tin từ Wikidata (optional)
 * - MVP: fileUrl lưu local path (mock cloud storage)
 * - Hỗ trợ định dạng PDF và EPUB
 */

// Schema nhúng cho wikidataInfo
const wikidataInfoSchema = new mongoose.Schema(
  {
    wikidataId: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    externalLinks: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Tiêu đề tài liệu là bắt buộc"],
      minlength: [5, "Tiêu đề phải có ít nhất 5 ký tự"],
      maxlength: [200, "Tiêu đề không được vượt quá 200 ký tự"],
      trim: true,
    },

    description: {
      type: String,
      maxlength: [2000, "Mô tả không được vượt quá 2000 ký tự"],
      trim: true,
      default: "",
    },

    author: {
      type: String,
      trim: true,
      default: null,
    },

    isbn: {
      type: String,
      trim: true,
      default: "",
    },

    publisher: {
      type: String,
      trim: true,
      default: null,
    },

    documentLanguage: {
      type: String,
      default: "Tiếng Việt",
    },

    publishYear: {
      type: Number,
      min: [1000, "Năm xuất bản không hợp lệ"],
      max: [
        new Date().getFullYear() + 1,
        "Năm xuất bản không được vượt quá năm hiện tại",
      ],
      default: null,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Danh mục là bắt buộc"],
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Người upload là bắt buộc"],
    },

    // MVP: Local file storage (mock cloud)
    fileUrl: {
      type: String,
      required: [true, "Đường dẫn file là bắt buộc"],
    },

    fileName: {
      type: String,
      required: [true, "Tên file là bắt buộc"],
    },

    fileSize: {
      type: Number,
      required: [true, "Kích thước file là bắt buộc"],
      max: [52428800, "Kích thước file không được vượt quá 50MB"], // 50MB
    },

    /**
     * File Format - Định dạng file
     * - pdf: File PDF
     * - epub: File EPUB (Ebook)
     */
    fileFormat: {
      type: String,
      enum: {
        values: ["pdf", "epub"],
        message: "Định dạng file không hợp lệ. Chỉ hỗ trợ PDF và EPUB.",
      },
      default: "pdf",
    },

    coverImage: {
      type: String,
      default: null,
    },

    pageCount: {
      type: Number,
      min: [0, "Số trang không thể âm"],
      default: null,
    },

    // Workflow: pending -> approved/rejected
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Trạng thái không hợp lệ",
      },
      default: "pending",
    },

    rejectionReason: {
      type: String,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    // Analytics
    views: {
      type: Number,
      default: 0,
      min: [0, "Số lượt xem không thể âm"],
    },

    downloads: {
      type: Number,
      default: 0,
      min: [0, "Số lượt tải không thể âm"],
    },

    rating: {
      type: Number,
      min: [0, "Đánh giá không thể âm"],
      max: [5, "Đánh giá không được vượt quá 5"],
      default: null,
    },

    commentCount: {
      type: Number,
      default: 0,
      min: [0, "Số lượng bình luận không thể âm"],
    },

    // LOD/Wikidata integration (optional)
    wikidataInfo: {
      type: wikidataInfoSchema,
      default: null,
    },

    lodMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },

  {
    timestamps: true, // createdAt, updatedAt
  },
);

/**
 * Indexes
 * - Full-text search trên title và description
 * - Index các field thường xuyên query
 */
documentSchema.index({ title: "text", description: "text" }); // Full-text search
documentSchema.index({ categoryId: 1 }); // Query by category
documentSchema.index({ uploadedBy: 1 }); // Query by uploader
documentSchema.index({ status: 1 }); // Query by status (pending/approved/rejected)
documentSchema.index({ views: -1 }); // Sort by views (descending)
documentSchema.index({ downloads: -1 }); // Sort by downloads (descending)
documentSchema.index({ fileFormat: 1 }); // Query by file format

/**
 * Virtual: Lấy đường dẫn đầy đủ của file (nếu cần)
 */
documentSchema.virtual("fullFileUrl").get(function () {
  if (this.fileUrl && !this.fileUrl.startsWith("http")) {
    return `${process.env.BASE_URL || "http://localhost:5000"}${this.fileUrl}`;
  }
  return this.fileUrl;
});

/**
 * Virtual: Kiểm tra file có phải EPUB không
 */
documentSchema.virtual("isEpub").get(function () {
  return this.fileFormat === "epub";
});

/**
 * Virtual: Kiểm tra file có phải PDF không
 */
documentSchema.virtual("isPdf").get(function () {
  return this.fileFormat === "pdf";
});

/**
 * Instance Method: Tăng view count
 */
documentSchema.methods.incrementViews = async function () {
  this.views += 1;
  return await this.save();
};

/**
 * Instance Method: Tăng download count
 */
documentSchema.methods.incrementDownloads = async function () {
  this.downloads += 1;
  return await this.save();
};

/**
 * Static Method: Tìm tài liệu đã được duyệt
 */
documentSchema.statics.findApproved = function (filters = {}) {
  return this.find({ ...filters, status: "approved" });
};

/**
 * Static Method: Tìm tài liệu đang chờ duyệt
 */
documentSchema.statics.findPending = function (filters = {}) {
  return this.find({ ...filters, status: "pending" });
};

/**
 * Static Method: Tìm tài liệu theo format
 */
documentSchema.statics.findByFormat = function (format, filters = {}) {
  return this.find({ ...filters, fileFormat: format });
};

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
