const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * User Schema
 * Lưu trữ thông tin tài khoản người dùng, vai trò, trạng thái
 *
 * QUAN TRỌNG (MVP):
 * - status được sửa thành { enum: ['active', 'locked'], default: 'active' }
 * - Bỏ qua activationToken và activationTokenExpires (mock email activation)
 * - Hỗ trợ đăng nhập Microsoft (passwordHash không bắt buộc khi authProvider = 'microsoft')
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Tên là bắt buộc"],
      minlength: [2, "Tên phải có ít nhất 2 ký tự"],
      maxlength: [100, "Tên không được vượt quá 100 ký tự"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      lowercase: true,
      trim: true,
      // SỬA: Cho phép cả @vanlanguni.vn và @vlu.edu.vn
      match: [
        /@(vanlanguni\.vn|vlu\.edu\.vn)$/,
        "Email phải có đuôi @vanlanguni.vn hoặc @vlu.edu.vn",
      ],
    },

    passwordHash: {
      type: String,
      // SỬA: Password chỉ bắt buộc khi đăng ký local (không qua Microsoft)
      required: [
        function () {
          return this.authProvider === "local";
        },
        "Mật khẩu là bắt buộc",
      ],
      default: null,
    },

    role: {
      type: String,
      enum: {
        values: ["Guest", "User", "Author", "Moderator", "Admin"],
        message: "Vai trò không hợp lệ",
      },
      default: "User",
    },

    status: {
      type: String,
      enum: {
        values: ["active", "locked"],
        message: "Trạng thái không hợp lệ",
      },
      default: "active",
    },

    avatarUrl: {
      type: String,
      default: null,
    },

    lockReason: {
      type: String,
      default: null,
    },

    /**
     * Microsoft Account ID
     * Lưu ID duy nhất từ Microsoft để tracking
     */
    microsoftId: {
      type: String,
      sparse: true,
      unique: true,
      // default: null,
    },

    /**
     * Auth Provider
     * Đánh dấu user đăng ký/đăng nhập qua phương thức nào
     * - 'local': Đăng ký bằng email/password thông thường
     * - 'microsoft': Đăng ký/đăng nhập qua Microsoft
     */
    authProvider: {
      type: String,
      enum: ["local", "microsoft"],
      default: "local",
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Indexes
 */
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ microsoftId: 1 }, { unique: true, sparse: true });

/**
 * Pre-save Hook: Tự động hash password trước khi lưu vào database
 * SỬA: Chỉ hash khi password tồn tại và được thay đổi
 */
userSchema.pre("save", async function (next) {
  // Bỏ qua nếu passwordHash không được modified hoặc không có giá trị
  if (!this.isModified("passwordHash") || !this.passwordHash) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: So sánh password
 * SỬA: Trả về false nếu user không có password (đăng nhập qua Microsoft)
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Nếu user đăng nhập qua Microsoft và không có password
  if (!this.passwordHash) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Instance Method: Chuyển đổi user object sang JSON response
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;

  user.id = user._id;
  delete user._id;

  return user;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
