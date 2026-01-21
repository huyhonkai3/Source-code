const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================== AWS S3 IMPORTS ====================
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

/**
 * Multer Middleware - File Upload Configuration
 * UPGRADED: Hỗ trợ cả Local Storage và AWS S3
 *
 * Mode:
 * - LOCAL: Lưu file vào thư mục local ./uploads/ (development)
 * - S3: Upload lên AWS S3 (production)
 *
 * Chuyển đổi mode qua biến môi trường: STORAGE_MODE=s3 hoặc STORAGE_MODE=local
 */

// ==================== CONFIGURATION ====================

// Xác định storage mode (mặc định là S3 nếu có config)
const isS3Enabled =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_BUCKET_NAME;

const STORAGE_MODE = process.env.STORAGE_MODE || (isS3Enabled ? "s3" : "local");

console.log(`[Upload Middleware] Storage Mode: ${STORAGE_MODE.toUpperCase()}`);

// ==================== AWS S3 CLIENT ====================

let s3Client = null;

if (STORAGE_MODE === "s3") {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  console.log(
    `[Upload Middleware] S3 Client initialized - Bucket: ${process.env.AWS_BUCKET_NAME}`,
  );
}

// ==================== LOCAL STORAGE SETUP ====================

const uploadDir = "./uploads";
const avatarDir = "./uploads/avatars";

if (STORAGE_MODE === "local") {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
  }
}

// ==================== ALLOWED FILE TYPES ====================

const ALLOWED_DOCUMENT_MIME_TYPES = {
  "application/pdf": "pdf",
  "application/epub+zip": "epub",
};

const ALLOWED_IMAGE_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
};

const ALLOWED_MIME_TYPES = {
  ...ALLOWED_DOCUMENT_MIME_TYPES,
  ...ALLOWED_IMAGE_MIME_TYPES,
};

const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".epub"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_EXTENSIONS = [
  ...ALLOWED_DOCUMENT_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
];

// ==================== FILE FILTERS ====================

/**
 * File Filter cho TÀI LIỆU (PDF, EPUB)
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
 * File Filter cho AVATAR (Images)
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
 * File Filter TỔNG HỢP
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

// ==================== STORAGE CONFIGURATIONS ====================

/**
 * Tạo unique filename
 */
const generateUniqueFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  // Sanitize original filename (remove special chars)
  const baseName = path
    .basename(originalname, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .substring(0, 50);
  return `${timestamp}-${random}-${baseName}${ext}`;
};

// ========== LOCAL STORAGE ==========

const localDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, generateUniqueFilename(file.originalname));
  },
});

const localAvatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const userId = req.user?.id || "unknown";
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

// ========== S3 STORAGE ==========

const s3DocumentStorage =
  STORAGE_MODE === "s3"
    ? multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        // Không set ACL vì bucket có thể không cho phép
        // acl: "public-read",
        contentType: multerS3.AUTO_CONTENT_TYPE, // QUAN TRỌNG: Để browser hiển thị thay vì download
        metadata: function (req, file, cb) {
          cb(null, {
            fieldName: file.fieldname,
            originalName: file.originalname,
            uploadedBy: req.user?.id || "anonymous",
          });
        },
        key: function (req, file, cb) {
          const filename = generateUniqueFilename(file.originalname);
          // Lưu vào folder documents/ trên S3
          cb(null, `documents/${filename}`);
        },
      })
    : null;

const s3AvatarStorage =
  STORAGE_MODE === "s3"
    ? multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, {
            fieldName: file.fieldname,
            userId: req.user?.id || "anonymous",
          });
        },
        key: function (req, file, cb) {
          const userId = req.user?.id || "unknown";
          const ext = path.extname(file.originalname).toLowerCase();
          // Lưu vào folder avatars/ trên S3
          cb(null, `avatars/avatar-${userId}-${Date.now()}${ext}`);
        },
      })
    : null;

// ==================== MULTER INSTANCES ====================

/**
 * Multer cho DOCUMENT upload
 */
const uploadDocument = multer({
  storage: STORAGE_MODE === "s3" ? s3DocumentStorage : localDocumentStorage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 52428800, // 50MB
  },
});

/**
 * Multer cho AVATAR upload
 */
const uploadAvatar = multer({
  storage: STORAGE_MODE === "s3" ? s3AvatarStorage : localAvatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5242880, // 5MB
  },
});

/**
 * Multer TỔNG HỢP (backward compatible)
 */
const upload = multer({
  storage: STORAGE_MODE === "s3" ? s3DocumentStorage : localDocumentStorage,
  fileFilter: combinedFileFilter,
  limits: {
    fileSize: 52428800, // 50MB
  },
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Lấy file format từ mimetype
 */
const getFileFormat = (mimetype) => {
  return ALLOWED_MIME_TYPES[mimetype] || "unknown";
};

/**
 * Kiểm tra file có phải ảnh không
 */
const isImageFile = (mimetype) => {
  return Object.keys(ALLOWED_IMAGE_MIME_TYPES).includes(mimetype);
};

/**
 * Kiểm tra file có phải tài liệu không
 */
const isDocumentFile = (mimetype) => {
  return Object.keys(ALLOWED_DOCUMENT_MIME_TYPES).includes(mimetype);
};

/**
 * Lấy URL của file sau khi upload
 * - S3: req.file.location (full URL)
 * - Local: /uploads/filename
 *
 * @param {Object} file - req.file object từ multer
 * @returns {string} URL của file
 */
const getFileUrl = (file) => {
  if (STORAGE_MODE === "s3") {
    // multer-s3 trả về location là full URL
    return file.location;
  } else {
    // Local storage: trả về relative path
    return `/uploads/${file.filename}`;
  }
};

/**
 * Lấy URL của avatar sau khi upload
 */
const getAvatarUrl = (file) => {
  if (STORAGE_MODE === "s3") {
    return file.location;
  } else {
    return `/uploads/avatars/${file.filename}`;
  }
};

/**
 * Xóa file từ storage (Local hoặc S3)
 *
 * @param {string} fileUrl - URL hoặc path của file cần xóa
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    if (STORAGE_MODE === "s3") {
      // Xóa file từ S3
      // Extract key từ URL: https://bucket.s3.region.amazonaws.com/key
      let key;
      if (fileUrl.includes(".amazonaws.com/")) {
        key = fileUrl.split(".amazonaws.com/")[1];
      } else if (
        fileUrl.startsWith("documents/") ||
        fileUrl.startsWith("avatars/")
      ) {
        key = fileUrl;
      } else {
        console.log(`[S3 Delete] Invalid URL format: ${fileUrl}`);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      console.log(`[S3 Delete] Deleted: ${key}`);
    } else {
      // Xóa file từ local storage
      const filePath = fileUrl.startsWith("/")
        ? path.join(".", fileUrl)
        : path.join(process.cwd(), fileUrl);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[Local Delete] Deleted: ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`[Delete File Error] ${fileUrl}:`, error.message);
  }
};

/**
 * Xóa file cũ (backward compatible alias)
 */
const deleteOldFile = deleteFile;

/**
 * Kiểm tra file có phải là S3 URL không
 */
const isS3Url = (url) => {
  return url && url.includes(".amazonaws.com/");
};

/**
 * Kiểm tra file có phải local path không
 */
const isLocalPath = (url) => {
  return url && url.startsWith("/uploads/");
};

// ==================== EXPORTS ====================

// Export middleware mặc định
module.exports = upload.single("file");

// Export các middleware riêng biệt
module.exports.uploadDocument = uploadDocument.single("file");
module.exports.uploadAvatar = uploadAvatar.single("avatar");

// Export helper functions
module.exports.getFileFormat = getFileFormat;
module.exports.isImageFile = isImageFile;
module.exports.isDocumentFile = isDocumentFile;
module.exports.getFileUrl = getFileUrl;
module.exports.getAvatarUrl = getAvatarUrl;
module.exports.deleteFile = deleteFile;
module.exports.deleteOldFile = deleteOldFile;
module.exports.isS3Url = isS3Url;
module.exports.isLocalPath = isLocalPath;

// Export constants
module.exports.STORAGE_MODE = STORAGE_MODE;
module.exports.ALLOWED_MIME_TYPES = ALLOWED_MIME_TYPES;
module.exports.ALLOWED_IMAGE_MIME_TYPES = ALLOWED_IMAGE_MIME_TYPES;
module.exports.ALLOWED_DOCUMENT_MIME_TYPES = ALLOWED_DOCUMENT_MIME_TYPES;

// Export S3 client cho advanced use cases
module.exports.s3Client = s3Client;
