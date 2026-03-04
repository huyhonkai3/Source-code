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
 * - [NEW] Quản lý bản quyền & Notice/Takedown
 */

// Schema nhúng cho wikidataInfo
const wikidataInfoSchema = new mongoose.Schema(
  {
    wikidataId: { type: String, default: null },
    label: { type: String, default: null },
    description: { type: String, default: null },
    externalLinks: { type: [String], default: [] },
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

    englishTitle: { type: String, trim: true, default: "" },

    description: {
      type: String,
      maxlength: [2000, "Mô tả không được vượt quá 2000 ký tự"],
      trim: true,
      default: "",
    },

    author: { type: String, trim: true, default: null },
    isbn: { type: String, trim: true, default: "" },
    publisher: { type: String, trim: true, default: null },
    documentLanguage: { type: String, default: "Tiếng Việt" },

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
      max: [52428800, "Kích thước file không được vượt quá 50MB"],
    },

    fileFormat: {
      type: String,
      enum: {
        values: ["pdf", "epub"],
        message: "Định dạng file không hợp lệ. Chỉ hỗ trợ PDF và EPUB.",
      },
      default: "pdf",
    },

    coverImage: { type: String, default: null },
    pageCount: {
      type: Number,
      min: [0, "Số trang không thể âm"],
      default: null,
    },

    /**
     * Workflow: pending -> approved | rejected
     * [NEW] HIDDEN: bị ẩn do report vi phạm, chờ Admin xử lý
     */
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected", "hidden"],
        message: "Trạng thái không hợp lệ",
      },
      default: "pending",
    },

    rejectionReason: { type: String, default: null },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },

    // ==================== [NEW] COPYRIGHT FIELDS ====================

    /**
     * Loại bản quyền do người đăng tải khai báo
     * - OWN_CREATION: Tác phẩm của chính mình
     * - PUBLIC_DOMAIN: Tài liệu thuộc phạm vi công cộng / mã nguồn mở
     * - THIRD_PARTY_AUTHORIZED: Tài liệu bên thứ 3, có giấy ủy quyền
     */
    copyrightType: {
      type: String,
      enum: {
        values: ["OWN_CREATION", "PUBLIC_DOMAIN", "THIRD_PARTY_AUTHORIZED"],
        message:
          "Loại bản quyền không hợp lệ. Phải là OWN_CREATION, PUBLIC_DOMAIN hoặc THIRD_PARTY_AUTHORIZED.",
      },
      default: "OWN_CREATION",
    },

    /**
     * URL file giấy ủy quyền / minh chứng bản quyền
     * Bắt buộc khi copyrightType === 'THIRD_PARTY_AUTHORIZED'
     */
    authorizationFileUrl: {
      type: String,
      default: null,
    },

    /**
     * Người dùng đã đồng ý Điều khoản Dịch vụ
     * Lưu vết để làm bằng chứng pháp lý
     */
    isTosAccepted: {
      type: Boolean,
      default: true,
    },

    /**
     * Cam đoan là tác giả gốc (chỉ áp dụng cho OWN_CREATION)
     */
    authorDeclaration: {
      type: Boolean,
      default: false,
    },

    // ==================== ANALYTICS ====================

    views: { type: Number, default: 0, min: [0, "Số lượt xem không thể âm"] },
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
      min: [0, "Số bình luận không thể âm"],
    },

    // LOD/Wikidata integration (optional)
    wikidataInfo: { type: wikidataInfoSchema, default: null },
    lodMetadata: { type: Object, default: null },
  },
  {
    timestamps: true,
  },
);

// ==================== INDEXES ====================
documentSchema.index({ title: "text", description: "text" });
documentSchema.index({ categoryId: 1 });
documentSchema.index({ uploadedBy: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ views: -1 });
documentSchema.index({ downloads: -1 });
documentSchema.index({ fileFormat: 1 });
documentSchema.index({ copyrightType: 1 }); // [NEW]

// ==================== VIRTUALS ====================

documentSchema.virtual("fullFileUrl").get(function () {
  if (this.fileUrl && !this.fileUrl.startsWith("http")) {
    return `${process.env.BASE_URL || "http://localhost:5000"}${this.fileUrl}`;
  }
  return this.fileUrl;
});

documentSchema.virtual("isEpub").get(function () {
  return this.fileFormat === "epub";
});

documentSchema.virtual("isPdf").get(function () {
  return this.fileFormat === "pdf";
});

// ==================== INSTANCE METHODS ====================

documentSchema.methods.incrementViews = async function () {
  this.views += 1;
  return await this.save();
};

documentSchema.methods.incrementDownloads = async function () {
  this.downloads += 1;
  return await this.save();
};

// ==================== STATIC METHODS ====================

documentSchema.statics.findApproved = function (filters = {}) {
  return this.find({ ...filters, status: "approved" });
};

documentSchema.statics.findPending = function (filters = {}) {
  return this.find({ ...filters, status: "pending" });
};

documentSchema.statics.findByFormat = function (format, filters = {}) {
  return this.find({ ...filters, fileFormat: format });
};

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;
