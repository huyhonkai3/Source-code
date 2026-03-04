const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ==================== AWS S3 IMPORTS ====================
const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const multerS3 = require("multer-s3");

/**
 * Multer Middleware - File Upload Configuration
 * Hỗ trợ cả Local Storage và AWS S3
 * Hỗ trợ upload.fields() cho authorizationFile (minh chứng bản quyền)
 */

// ==================== CONFIGURATION ====================

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
const authorizationDir = "./uploads/authorizations"; // [NEW]

if (STORAGE_MODE === "local") {
  [uploadDir, avatarDir, authorizationDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
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

// [NEW] MIME types hợp lệ cho file giấy ủy quyền (PDF + Images)
const ALLOWED_AUTHORIZATION_MIME_TYPES = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const ALLOWED_MIME_TYPES = {
  ...ALLOWED_DOCUMENT_MIME_TYPES,
  ...ALLOWED_IMAGE_MIME_TYPES,
};

const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".epub"];
const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_AUTHORIZATION_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"]; // [NEW]
const ALLOWED_EXTENSIONS = [
  ...ALLOWED_DOCUMENT_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
];

// ==================== FILE FILTERS ====================

const documentFileFilter = function (req, file, cb) {
  // Lọc theo fieldname
  if (file.fieldname === "authorizationFile") {
    // File minh chứng bản quyền: chỉ nhận PDF/Image
    const ext = path.extname(file.originalname).toLowerCase();
    const isValidMime = Object.keys(ALLOWED_AUTHORIZATION_MIME_TYPES).includes(
      file.mimetype,
    );
    const isValidExt = ALLOWED_AUTHORIZATION_EXTENSIONS.includes(ext);
    if (isValidMime && isValidExt) {
      cb(null, true);
    } else {
      cb(
        new Error("File giấy ủy quyền chỉ chấp nhận PDF, JPG hoặc PNG."),
        false,
      );
    }
    return;
  }

  // File tài liệu chính (file, thumbnail)
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

const combinedFileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidMimeType = Object.keys(ALLOWED_MIME_TYPES).includes(
    file.mimetype,
  );
  const isValidExtension = ALLOWED_EXTENSIONS.includes(ext);

  if (isValidMimeType && isValidExtension) {
    cb(null, true);
  } else {
    cb(new Error("Định dạng file không được hỗ trợ."), false);
  }
};

// ==================== UNIQUE FILENAME ====================

const generateUniqueFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const baseName = path
    .basename(originalname, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .substring(0, 50);
  return `${timestamp}-${random}-${baseName}${ext}`;
};

// ==================== LOCAL STORAGE CONFIGS ====================

const localDocumentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // [NEW] Chọn thư mục theo fieldname
    if (file.fieldname === "authorizationFile") {
      cb(null, authorizationDir);
    } else {
      cb(null, uploadDir);
    }
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

// ==================== S3 STORAGE CONFIGS ====================

const s3DocumentStorage =
  STORAGE_MODE === "s3"
    ? multerS3({
        s3: s3Client,
        bucket: process.env.AWS_BUCKET_NAME,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function (req, file, cb) {
          cb(null, {
            fieldName: file.fieldname,
            originalName: file.originalname,
            uploadedBy: req.user?.id || "anonymous",
          });
        },
        key: function (req, file, cb) {
          const filename = generateUniqueFilename(file.originalname);
          // [NEW] Lưu vào folder tương ứng trên S3
          if (file.fieldname === "authorizationFile") {
            cb(null, `authorizations/${filename}`);
          } else {
            cb(null, `documents/${filename}`);
          }
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
          cb(null, `avatars/avatar-${userId}-${Date.now()}${ext}`);
        },
      })
    : null;

// ==================== MULTER INSTANCES ====================

/**
 * Multer cho DOCUMENT upload (single file - backward compat)
 */
const uploadDocument = multer({
  storage: STORAGE_MODE === "s3" ? s3DocumentStorage : localDocumentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 52428800 }, // 50MB
});

/**
 * [NEW] Multer cho upload NHIỀU FIELDS:
 * - file: Tài liệu chính (PDF/EPUB)
 * - thumbnail: Ảnh bìa (optional)
 * - authorizationFile: Giấy ủy quyền bản quyền (PDF/Image, optional)
 */
const uploadDocumentFields = multer({
  storage: STORAGE_MODE === "s3" ? s3DocumentStorage : localDocumentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 52428800 }, // 50MB
}).fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "authorizationFile", maxCount: 1 },
]);

/**
 * Multer cho AVATAR upload
 */
const uploadAvatar = multer({
  storage: STORAGE_MODE === "s3" ? s3AvatarStorage : localAvatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5242880 }, // 5MB
});

/**
 * Multer TỔNG HỢP (backward compatible)
 * Dùng upload.single("file") như cũ
 */
const upload = multer({
  storage: STORAGE_MODE === "s3" ? s3DocumentStorage : localDocumentStorage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: 52428800 },
});

// ==================== HELPER FUNCTIONS ====================

const getFileFormat = (mimetype) => {
  return ALLOWED_MIME_TYPES[mimetype] || "unknown";
};

const isImageFile = (mimetype) => {
  return Object.keys(ALLOWED_IMAGE_MIME_TYPES).includes(mimetype);
};

const isDocumentFile = (mimetype) => {
  return Object.keys(ALLOWED_DOCUMENT_MIME_TYPES).includes(mimetype);
};

/**
 * Lấy URL file sau khi upload
 * - S3: req.file.location (full URL)
 * - Local: path tương đối /uploads/... hoặc /uploads/authorizations/...
 */
const getFileUrl = (file) => {
  if (STORAGE_MODE === "s3") {
    return file.location;
  } else {
    // Xác định sub-folder dựa trên fieldname
    if (file.fieldname === "authorizationFile") {
      return `/uploads/authorizations/${file.filename}`;
    }
    return `/uploads/${file.filename}`;
  }
};

const getAvatarUrl = (file) => {
  if (STORAGE_MODE === "s3") {
    return file.location;
  } else {
    return `/uploads/avatars/${file.filename}`;
  }
};

/**
 * Xóa file từ storage (Local hoặc S3)
 */
const deleteFile = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    if (STORAGE_MODE === "s3") {
      let key;
      if (fileUrl.includes(".amazonaws.com/")) {
        key = fileUrl.split(".amazonaws.com/")[1];
      } else if (
        fileUrl.startsWith("documents/") ||
        fileUrl.startsWith("avatars/") ||
        fileUrl.startsWith("authorizations/")
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

const deleteOldFile = deleteFile;

const isS3Url = (url) => {
  return url && url.includes(".amazonaws.com/");
};

const isLocalPath = (url) => {
  return url && url.startsWith("/uploads/");
};

// ==================== EXPORTS ====================

// Export middleware mặc định (backward compat - single file)
module.exports = upload.single("file");

// Export các middleware riêng biệt
module.exports.uploadDocument = uploadDocument.single("file");
module.exports.uploadDocumentFields = uploadDocumentFields; // [NEW] multi-fields
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
module.exports.ALLOWED_AUTHORIZATION_MIME_TYPES =
  ALLOWED_AUTHORIZATION_MIME_TYPES; // [NEW]

// Export S3 client
module.exports.s3Client = s3Client;
