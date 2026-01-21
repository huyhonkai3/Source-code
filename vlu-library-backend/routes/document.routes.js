const express = require("express");
const router = express.Router();
const documentController = require("../controllers/document.controller");
const { checkAuth, checkRole } = require("../middleware/auth.middleware");
const { checkAuthOptional } = require("../middleware/auth.optional.middleware");
const uploadMiddleware = require("../middleware/upload.middleware");
const commentController = require("../controllers/comment.controller");

/**
 * Document Routes
 * Module 2: Quản lý tài liệu
 */

/**
 * route   POST /api/documents/upload
 * desc    Tải lên tài liệu mới (API 2.5 - F6)
 * access  Author, Admin
 *
 * 1. checkAuth - Xác thực user
 * 2. checkRole(['Author', 'Admin']) - Kiểm tra quyền
 * 3. uploadMiddleware - Xử lý file upload (multer)
 * 4. documentController.uploadDocument - Xử lý logic
 */
router.post(
  "/upload",
  checkAuth,
  checkRole(["Author", "Admin"]),
  uploadMiddleware,
  documentController.uploadDocument,
);

/**
 * @route   GET /api/documents/my-documents
 * @desc    Lấy danh sách tài liệu của tác giả hiện tại
 * @access  Author, Admin
 * @returns { documents: Array, pagination: Object, stats: Object }
 *
 * Route này phải đặt TRƯỚC route GET /:id
 * để tránh Express routing conflict (my-documents bị hiểu thành :id)
 */
router.get(
  "/my-documents",
  checkAuth,
  checkRole(["Author", "Admin"]),
  documentController.getMyDocuments,
);

/**
 * @route   GET /api/documents/featured
 * @desc    Lấy tài liệu nổi bật cho Landing Page
 * @access  Public (không cần đăng nhập)
 * @query   type - 'newest' | 'popular' | 'most-downloaded' | 'top-rated'
 * @query   limit - Số lượng (1-12, default: 8)
 */
router.get("/featured", documentController.getFeaturedDocuments);

/**
 * @route   GET /api/documents/public-stats
 * @desc    Lấy thống kê công khai cho Landing Page
 * @access  Public (không cần đăng nhập)
 * @returns { documents: number, users: number, views: number, downloads: number }
 */
router.get("/public-stats", documentController.getPublicStats);

/**
 * route   GET /api/documents
 * desc    Lấy danh sách tài liệu đã duyệt (API 2.7 - F11)
 * access  Public (không cần đăng nhập)
 * returns { documents: Array, pagination: Object }
 */
router.get("/", documentController.getDocuments);

/**
 * @route   PUT /api/documents/:id (API 2.10 - Author)
 * @desc    Cập nhật tài liệu (API 2.10 - Author)
 * @access  Author/Admin
 * @param   id - Document ID
 */
router.put("/:id", checkAuth, documentController.updateDocument);

/**
 * @route   DELETE /api/documents/:id (API 2.11 - Author/Admin)
 * @desc    Xóa tài liệu (API 2.11 - Author/Admin)
 * @access  Author/Admin
 * @param   id - Document ID
 */
router.delete("/:id", checkAuth, documentController.deleteDocument);

/**
 * route   GET /api/documents/:id/download
 * desc    Tải xuống tài liệu (API 2.12 - F13)
 * access  User, Author, Moderator, Admin (phải đăng nhập)
 * returns Stream PDF với header 'attachment'
 * - Chỉ tài liệu có status='approved' mới được tải - Chưa phân quyền theo user role nâng cao
 * - Stream file PDF trực tiếp
 * - Content-Disposition: attachment (tải file về máy)
 */
router.get(
  "/:id/download",
  checkAuth,
  checkRole(["User", "Author", "Moderator", "Admin"]),
  documentController.downloadDocument,
);

/**
 * route   POST /api/documents/:id/track
 * desc    Ghi nhận lượt xem/tải (API 2.12 Track - F14)
 * access  User, Author, Moderator, Admin (phải đăng nhập)
 * body    { type: 'view' | 'download' }
 * returns { success: boolean, isFirstTime: boolean }
 *
 * LOGIC CHỐNG SPAM:
 * - Sử dụng compound unique index trong Statistics model
 * - 1 user chỉ được track 1 lần/loại/tài liệu/ngày
 * - Nếu đã track trong ngày -> trả về success nhưng không tăng counter
 * - Nếu là lần đầu trong ngày -> tăng views/downloads trong document
 *
 * Frontend gọi API này ngay sau khi:
 * - User click "Đọc" -> gọi track với type='view'
 * - User click "Tải" -> gọi track với type='download'
 */
router.post("/:id/track", checkAuth, documentController.trackDocument);

/**
 * route   GET /api/documents/:id/read
 * desc    Đọc tài liệu trực tuyến (API 2.15 - F12)
 * access  User, Author, Moderator, Admin (phải đăng nhập)
 * returns Stream PDF với header 'inline'
 * - Chỉ tài liệu có status='approved' mới được đọc - Chưa phân quyền theo user role nâng cao
 * - Stream file PDF trực tiếp, không qua JSON response - Chưa sử dụng PDF.js
 * - Content-Disposition: inline (hiển thị trên trình duyệt)
 */
router.get(
  "/:id/read",
  checkAuth,
  checkRole(["User", "Author", "Moderator", "Admin"]),
  documentController.readDocument,
);

/**
 * route   GET /api/documents/:id
 * desc    Lấy chi tiết tài liệu (API 2.9)
 * access  Public (có phân quyền xem tài liệu pending/rejected)
 * params  id - Document ID
 *
 * - Sử dụng checkAuthOptional để parse JWT nếu có
 * - Tài liệu approved: Public - ai cũng xem được
 * - Tài liệu pending/rejected: Chỉ Admin, Moderator, hoặc chủ sở hữu
 *
 * Route này phải đặt CUỐI CÙNG
 * Nếu đặt trước các route khác (/:id/read, /:id/download),
 * Express sẽ match "read" hoặc "download" như là id
 */
router.get("/:id", checkAuthOptional, documentController.getDocumentById);

module.exports = router;
