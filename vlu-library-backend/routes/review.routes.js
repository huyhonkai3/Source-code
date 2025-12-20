const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { checkAuth } = require("../middleware/auth.middleware");

/**
 * Review Routes
 * Quản lý đánh giá tài liệu
 */

/**
 * route   POST /api/reviews
 * desc    Thêm đánh giá mới
 * access  Authenticated
 * body    { docId, rating, content }
 */
router.post("/", checkAuth, reviewController.addReview);

/**
 * route   GET /api/reviews/check/:docId
 * desc    Kiểm tra user đã review chưa
 * access  Authenticated
 * IMPORTANT: This must come BEFORE /:docId to avoid route conflict
 */
router.get("/check/:docId", checkAuth, reviewController.checkUserReview);

/**
 * route   GET /api/reviews/:docId
 * desc    Lấy danh sách đánh giá theo docId
 * access  Public
 * query   page, limit
 */
router.get("/:docId", reviewController.getReviewsByDocId);

/**
 * route   PUT /api/reviews/:id
 * desc    Cập nhật đánh giá
 * access  Authenticated (owner only)
 * body    { rating, content }
 */
router.put("/:id", checkAuth, reviewController.updateReview);

/**
 * route   DELETE /api/reviews/:id
 * desc    Xóa đánh giá
 * access  Authenticated (owner or admin)
 */
router.delete("/:id", checkAuth, reviewController.deleteReview);

module.exports = router;
