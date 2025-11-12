const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * Lưu trữ thông tin tài khoản người dùng, vai trò, trạng thái
 * 
 * QUAN TRỌNG (MVP): 
 * - status được sửa thành { enum: ['active', 'locked'], default: 'active' }
 * - Bỏ qua activationToken và activationTokenExpires (mock email activation)
 */
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Tên là bắt buộc'], 
    minlength: [2, 'Tên phải có ít nhất 2 ký tự'],
    maxlength: [100, 'Tên không được vượt quá 100 ký tự'],
    trim: true
  },
  
  email: { 
    type: String, 
    required: [true, 'Email là bắt buộc'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/@vanlanguni\.vn$/, 'Email phải có đuôi @vanlanguni.vn']
  },
  
  passwordHash: { 
    type: String, 
    required: [true, 'Mật khẩu là bắt buộc']
  },
  
  role: { 
    type: String, 
    enum: {
      values: ['Guest', 'User', 'Author', 'Moderator', 'Admin'],
      message: 'Vai trò không hợp lệ'
    },
    default: 'User'
  },
  
  status: { 
    type: String, 
    enum: {
      values: ['active', 'locked'], // MVP: Chỉ có 2 trạng thái (bỏ 'pending_activation')
      message: 'Trạng thái không hợp lệ'
    },
    default: 'active' // MVP: Tự động active khi đăng ký
  },
  
  avatarUrl: { 
    type: String, 
    default: null 
  },
  
  lockReason: { 
    type: String, 
    default: null 
  }
  
  // MVP: BỎ QUA các trường sau (mock email activation)
  // activationToken: { type: String, default: null },
  // activationTokenExpires: { type: Date, default: null }
  
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

/**
 * Indexes
 * - email: unique index (đảm bảo email không trùng lặp)
 * - role: index (tối ưu query theo vai trò)
 * - status: index (tối ưu query theo trạng thái)
 */
// userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

/**
 * Pre-save Hook: Tự động hash password trước khi lưu vào database
 * Chỉ hash khi password được thay đổi (tránh hash lại khi update các field khác)
 */
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó được modified
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Generate salt và hash password
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: So sánh password
 * Dùng để verify password khi đăng nhập
 * param {string} candidatePassword - Password người dùng nhập vào
 * returns {Promise<boolean>} - True nếu password đúng
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Instance Method: Chuyển đổi user object sang JSON response
 * Loại bỏ các field nhạy cảm (passwordHash)
 * returns {Object} - User object an toàn để trả về client
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.__v;
  
  // Đổi _id thành id để response đẹp hơn
  user.id = user._id;
  delete user._id;
  
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
