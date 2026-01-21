const express = require("express");
const router = express.Router();
const { checkAuth } = require("../middleware/auth.middleware");
const commentController = require("../controllers/comment.controller");

/**
 * Comment Routes
 * Mount point: /api/comments
 *
 * IMPORTANT: Routes redesigned for clarity and to avoid conflicts
 * - Use /document/:docId for getting comments (specific route)
 * - Use /:id for comment operations (parametric route)
 * - Use /:id/like for like toggle (specific route before parametric)
 */

/**
 * @route   GET /api/comments/document/:docId
 * @desc    Lấy danh sách bình luận theo docId
 * @access  Public
 * @query   page, limit
 *
 * Example: GET /api/comments/document/507f1f77bcf86cd799439011?page=1&limit=20
 */
router.get("/document/:docId", commentController.getCommentsByDocId);

/**
 * @route   POST /api/comments
 * @desc    Thêm bình luận mới
 * @access  Authenticated
 * @body    { docId, content }
 *
 * Example: POST /api/comments
 *          Body: { "docId": "507f...", "content": "Great document!" }
 */
router.post("/", checkAuth, commentController.addComment);

/**
 * @route   POST /api/comments/:id/like
 * @desc    Toggle like bình luận (Like/Unlike)
 * @access  Authenticated
 *
 * Example: POST /api/comments/507f1f77bcf86cd799439011/like
 *
 * Response:
 * {
 *   status: "success",
 *   message: "Đã thích bình luận" | "Đã bỏ thích bình luận",
 *   data: {
 *     isLiked: true | false,
 *     likeCount: 5,
 *     likes: ["userId1", "userId2", ...]
 *   }
 * }
 *
 * NOTE: Route này phải đặt TRƯỚC route /:id để tránh conflict
 */
router.post("/:id/like", checkAuth, commentController.toggleLike);

/**
 * @route   PUT /api/comments/:id
 * @desc    Cập nhật bình luận (Owner only)
 * @access  Authenticated
 * @body    { content }
 *
 * Example: PUT /api/comments/507f1f77bcf86cd799439011
 *          Body: { "content": "Updated content" }
 */
router.put("/:id", checkAuth, commentController.updateComment);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Xóa bình luận (Owner or Admin)
 * @access  Authenticated
 *
 * Example: DELETE /api/comments/507f1f77bcf86cd799439011
 */
router.delete("/:id", checkAuth, commentController.deleteComment);

module.exports = router;
