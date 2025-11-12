const mongoose = require("mongoose");

/**
 * Category Schema
 * Lưu trữ thông tin danh mục tài liệu
 *
 * Business Logic:
 * - Hỗ trợ cấu trúc phân cấp (parentId)
 * - Slug tự động tạo từ name (dùng để URL-friendly)
 * - documentCount để đếm số tài liệu trong danh mục (hỗ trợ validation xóa)
 */
const categorySchema = new mongoose.Schema(
{
    name: {
    type: String,
    required: [true, "Tên danh mục là bắt buộc"],
    unique: true,
    minlength: [2, "Tên danh mục phải có ít nhất 2 ký tự"],
    maxlength: [100, "Tên danh mục không được vượt quá 100 ký tự"],
    trim: true,
    },

    description: {
    type: String,
    maxlength: [500, "Mô tả không được vượt quá 500 ký tự"],
    default: "",
    trim: true,
    },

    slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    },

    parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
    },

    documentCount: {
    type: Number,
    default: 0,
    min: [0, "Số lượng tài liệu không thể âm"],
    },
},
{
    timestamps: true,
}
);

/**
 * Indexes
 * - name: unique index
 * - slug: unique index (dùng để query URL-friendly)
 * - parentId: index (tối ưu query danh mục con)
 */
categorySchema.index({ name: 1 }, { unique: true });
// categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentId: 1 });

/**
 * Pre-save Hook: Tự động tạo slug từ name nếu slug không được cung cấp
 * Slug format: "cong-nghe-thong-tin" (lowercase, remove accents, replace spaces with -)
 */
categorySchema.pre("save", function (next) {
    if (this.isNew || this.isModified("name")) {
        this.slug = slugify(this.name);
    }
    next();
});

/**
 * Helper function: Chuyển đổi string thành slug
 * - Chuyển thành lowercase
 * - Bỏ dấu tiếng Việt
 * - Thay khoảng trắng bằng dấu gạch ngang
 * - Loại bỏ ký tự đặc biệt
 *
 * param {string} text - Text cần chuyển thành slug
 * returns {string} - Slug
 */
function slugify(text) {
    // Bảng chuyển đổi ký tự có dấu sang không dấu
    const from =
        "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ";
    const to =
        "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD";

    let slug = text.toLowerCase().trim();

    // Thay thế ký tự có dấu
    for (let i = 0; i < from.length; i++) {
        slug = slug.replace(new RegExp(from[i], "g"), to[i]);
    }

    // Thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
    slug = slug
        .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự đặc biệt
        .replace(/\s+/g, "-") // Thay khoảng trắng bằng -
        .replace(/-+/g, "-") // Loại bỏ nhiều dấu - liên tiếp
        .replace(/^-+|-+$/g, ""); // Loại bỏ dấu - ở đầu và cuối

    return slug;
}

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
