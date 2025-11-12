const mongoose = require('mongoose');

/**
 * RefreshToken Schema
 * Lưu trữ Refresh Token để quản lý phiên đăng nhập và hỗ trợ làm mới Access Token
 * 
 * Business Logic:
 * - Mỗi user có thể có nhiều refresh token (đa thiết bị)
 * - Token có thể bị revoke (thu hồi)
 * - Token tự động xóa sau khi hết hạn (TTL index)
 */
const refreshTokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'userId là bắt buộc']
  },
  
  token: { 
    type: String, 
    required: [true, 'Token là bắt buộc'],
    unique: true 
  },
  
  expiresAt: { 
    type: Date, 
    required: [true, 'expiresAt là bắt buộc']
  },
  
  isRevoked: { 
    type: Boolean, 
    default: false 
  },
  
  deviceInfo: { 
    type: String,
    default: null 
  },
  
  ipAddress: { 
    type: String,
    default: null 
  }
  
}, {
  timestamps: { 
    createdAt: true,  // Chỉ cần createdAt (khi token được tạo)
    updatedAt: false  // Không cần updatedAt (token không bao giờ update, chỉ revoke hoặc xóa)
  }
});

/**
 * Indexes
 * - token: unique index
 * - userId: index (query token của user)
 * - expiresAt: TTL index (tự động xóa token hết hạn)
 */
refreshTokenSchema.index({ token: 1 }, { unique: true });
refreshTokenSchema.index({ userId: 1 });

/**
 * TTL Index - Tự động xóa document sau khi expiresAt
 * expireAfterSeconds: 0 nghĩa là xóa ngay khi expiresAt đến
 * MongoDB sẽ chạy background job mỗi 60 giây để dọn dẹp
 */
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Static Method: Tạo refresh token mới
 * param {ObjectId} userId - ID của user
 * param {string} token - JWT refresh token string
 * param {Date} expiresAt - Thời gian hết hạn
 * param {Object} options - deviceInfo, ipAddress
 * returns {Promise<RefreshToken>}
 */
refreshTokenSchema.statics.createToken = async function(userId, token, expiresAt, options = {}) {
  return await this.create({
    userId,
    token,
    expiresAt,
    deviceInfo: options.deviceInfo || null,
    ipAddress: options.ipAddress || null
  });
};

/**
 * Static Method: Tìm token hợp lệ (chưa revoke, chưa hết hạn)
 * @param {string} token - JWT refresh token string
 * @returns {Promise<RefreshToken|null>}
 */
refreshTokenSchema.statics.findValidToken = async function(token) {
  return await this.findOne({
    token,
    isRevoked: false,
    expiresAt: { $gt: new Date() } // Chưa hết hạn
  });
};

/**
 * Static Method: Thu hồi (revoke) token
 * @param {string} token - JWT refresh token string
 * @returns {Promise<boolean>}
 */
refreshTokenSchema.statics.revokeToken = async function(token) {
  const result = await this.updateOne(
    { token },
    { $set: { isRevoked: true } }
  );
  return result.modifiedCount > 0;
};

/**
 * Static Method: Xóa token (dùng cho token rotation)
 * param {string} token - JWT refresh token string
 * returns {Promise<boolean>}
 */
refreshTokenSchema.statics.deleteToken = async function(token) {
  const result = await this.deleteOne({ token });
  return result.deletedCount > 0;
};

/**
 * Static Method: Xóa tất cả token của một user (logout all devices)
 * param {ObjectId} userId - ID của user
 * returns {Promise<number>} - Số token đã xóa
 */
refreshTokenSchema.statics.deleteAllUserTokens = async function(userId) {
  const result = await this.deleteMany({ userId });
  return result.deletedCount;
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
