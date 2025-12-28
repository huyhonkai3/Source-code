const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Multer Middleware - File Upload Configuration
 * Dùng để xử lý upload file tài liệu (PDF, EPUB) và ảnh đại diện
 *
 * MVP Implementation:
 * - Mock cloud storage: lưu file vào thư mục local ./uploads/
 * - Chấp nhận file PDF, EPUB và ảnh (JPEG, PNG, GIF, WEBP)
 * - Giới hạn kích thước file: 50MB cho tài liệu, 5MB cho ảnh
 */

// Đảm bảo thư mục uploads tồn tại
const uploadDir = "./uploads";
const avatarDir = "./uploads/avatars";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

/**
 * Danh sách MIME types được hỗ trợ cho TÀI LIỆU
 */
const ALLOWED_DOCUMENT_MIME_TYPES = {
  "application/pdf": "pdf",
  "application/epub+zip": "epub",
};

/**
 * Danh sách MIME types được hỗ trợ cho ẢNH
 */
const ALLOWED_IMAGE_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

/**
 * Kết hợp tất cả MIME types
 */
const ALLOWED_MIME_TYPES = {
  ...ALLOWED_DOCUMENT_MIME_TYPES,
  ...ALLOWED_IMAGE_MIME_TYPES,
};

/**
 * Danh sách extensions được hỗ trợ
 */
const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".epub"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_EXTENSIONS = [
  ...ALLOWED_DOCUMENT_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
];

/**
 * Storage Configuration cho TÀI LIỆU
 * Sử dụng diskStorage để lưu file vào local disk (mock cloud)
 */
const documentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * Storage Configuration cho AVATAR
 * Lưu vào thư mục riêng uploads/avatars/
 */
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    // Sử dụng userId để dễ quản lý và tránh rác
    const userId = req.user?.id || "unknown";
    const uniqueName = `avatar-${userId}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

/**
 * File Filter cho TÀI LIỆU
 * Chỉ chấp nhận file PDF và EPUB
 */
const documentFileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMimeType = Object.keys(ALLOWED_DOCUMENT_MIME_TYPES).includes(
    file.mimetype,
  );
  const isValidExtension = ALLOWED_DOCUMENT_EXTENSIONS.includes(ext);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Định dạng file không được hỗ trợ. Chỉ chấp nhận file PDF và EPUB.",
      ),
      false,
    );
  }
};

/**
 * File Filter cho AVATAR
 * Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)
 */
const avatarFileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMimeType = Object.keys(ALLOWED_IMAGE_MIME_TYPES).includes(
    file.mimetype,
  );
  const isValidExtension = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Định dạng file không được hỗ trợ. Chỉ chấp nhận ảnh JPG, PNG, GIF hoặc WEBP.",
      ),
      false,
    );
  }
};

/**
 * File Filter TỔNG HỢP (cho cả tài liệu và ảnh)
 * Dùng khi cần accept cả hai loại
 */
const combinedFileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMimeType = Object.keys(ALLOWED_MIME_TYPES).includes(
    file.mimetype,
  );
  const isValidExtension = ALLOWED_EXTENSIONS.includes(ext);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Định dạng file không được hỗ trợ. Chỉ chấp nhận file PDF, EPUB hoặc ảnh (JPG, PNG, GIF, WEBP).",
      ),
      false,
    );
  }
};

/**
 * Multer Configuration cho TÀI LIỆU
 */
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 52428800, // 50MB = 50 * 1024 * 1024 bytes
  },
});

/**
 * Multer Configuration cho AVATAR
 */
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5242880, // 5MB = 5 * 1024 * 1024 bytes
  },
});

/**
 * Multer Configuration TỔNG HỢP (backward compatible)
 */
const upload = multer({
  storage: documentStorage,
  fileFilter: combinedFileFilter,
  limits: {
    fileSize: 52428800, // 50MB
  },
});

/**
 * Helper function để xác định format file từ mimetype
 * @param {string} mimetype - MIME type của file
 * @returns {string} - Format: 'pdf', 'epub', 'jpg', 'png', etc.
 */
const getFileFormat = (mimetype) => {
  return ALLOWED_MIME_TYPES[mimetype] || "unknown";
};

/**
 * Helper function để kiểm tra file có phải là ảnh không
 * @param {string} mimetype - MIME type của file
 * @returns {boolean}
 */
const isImageFile = (mimetype) => {
  return Object.keys(ALLOWED_IMAGE_MIME_TYPES).includes(mimetype);
};

/**
 * Helper function để kiểm tra file có phải là tài liệu không
 * @param {string} mimetype - MIME type của file
 * @returns {boolean}
 */
const isDocumentFile = (mimetype) => {
  return Object.keys(ALLOWED_DOCUMENT_MIME_TYPES).includes(mimetype);
};

/**
 * Helper function để xóa file cũ (dùng cho avatar)
 * @param {string} filePath - Đường dẫn file cần xóa
 */
const deleteOldFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted old file: ${filePath}`);
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
    }
  }
};

// ==================== EXPORTS ====================

/**
 * Export middleware mặc định để xử lý single file với field name 'file'
 * router.post('/upload', uploadMiddleware, controller)
 */
module.exports = upload.single("file");

// Export các middleware riêng biệt
module.exports.uploadDocument = uploadDocument.single("file");
module.exports.uploadAvatar = uploadAvatar.single("avatar");

// Export helper functions
module.exports.getFileFormat = getFileFormat;
module.exports.isImageFile = isImageFile;
module.exports.isDocumentFile = isDocumentFile;
module.exports.deleteOldFile = deleteOldFile;

// Export constants
module.exports.ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
module.exports.ALLOWED_IMAGE_MIME_TYPES = ALLOWED_IMAGE_MIME_TYPES;
module.exports.ALLOWED_DOCUMENT_MIME_TYPES = ALLOWED_DOCUMENT_MIME_TYPES;
