const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Multer Middleware - File Upload Configuration
 * Dùng để xử lý upload file PDF cho tài liệu
 *
 * MVP Implementation:
 * - Mock cloud storage: lưu file vào thư mục local ./uploads/
 * - Chỉ chấp nhận file PDF
 * - Giới hạn kích thước file: 50MB
 */

// Đảm bảo thư mục uploads tồn tại
const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Storage Configuration
 * Sử dụng diskStorage để lưu file vào local disk (mock cloud)
 */
const storage = multer.diskStorage({
    // Đích đến: thư mục ./uploads/
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    // Tên file: Tạo tên unique để tránh trùng lặp
    // Format: timestamp-originalname
    filename: function (req, file, cb) {
        // Lấy extension từ originalname
        const ext = path.extname(file.originalname);
        // Tạo tên file: timestamp + random + extension
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, uniqueName);
    },
});

/**
 * File Filter
 * Chỉ chấp nhận file PDF
 */
const fileFilter = function (req, file, cb) {
    // Kiểm tra mimetype
    if (file.mimetype === "application/pdf") {
        // Accept file
        cb(null, true);
    } else {
        // Reject file với error message
        cb(new Error("Chỉ chấp nhận file PDF!"), false);
    }
};

/**
 * Multer Configuration
 */
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 52428800, // 50MB = 50 * 1024 * 1024 bytes
    },
});

/**
 * Export middleware để xử lý single file với field name 'file'
 * router.post('/upload', uploadMiddleware, controller)
 */
module.exports = upload.single("file");
