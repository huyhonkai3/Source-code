const Comment = require("../models/comment.model");
const Document = require("../models/document.model");

/* API 3.1 – Thêm bình luận mới (Hỗ trợ Reply)
 * @route POST /api/comments
 * @body {string} docId - ID của tài liệu
 * @body {string} content - Nội dung bình luận
 * @body {string} parentId - ID comment cha (optional, null = comment gốc)
 * @returns {object} - Thông tin bình luận mới
 */
exports.addComment = async (req, res) => {
  try {
    const { docId, content, parentId = null } = req.body;
    const userId = req.user.id;

    // Validation
    if (!docId || !content) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Thông tin không đầy đủ",
        errors: [
          {
            field: "all",
            message: "Document ID và nội dung là bắt buộc",
          },
        ],
      });
    }

    // Validate content length
    if (content.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Nội dung bình luận không được để trống",
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Nội dung bình luận không được vượt quá 500 ký tự",
      });
    }

    // Check if document exists
    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    // NEW: Validate parentId nếu có (reply)
    if (parentId) {
      const parentComment = await Comment.findById(parentId);

      if (!parentComment) {
        return res.status(404).json({
          status: "error",
          code: 404,
          message: "Không tìm thấy bình luận gốc để trả lời",
        });
      }

      // Kiểm tra parent comment có bị xóa không
      if (parentComment.isDeleted) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "Không thể trả lời bình luận đã bị xóa",
        });
      }

      // GIỚI HẠN 2 CẤP: Không cho phép reply của reply
      if (parentComment.parentId !== null) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message:
            "Chỉ có thể trả lời bình luận gốc (không hỗ trợ trả lời lồng nhau)",
        });
      }

      // Đảm bảo reply cùng docId với parent
      if (parentComment.docId.toString() !== docId.toString()) {
        return res.status(400).json({
          status: "error",
          code: 400,
          message: "Bình luận trả lời phải thuộc cùng tài liệu",
        });
      }
    }

    // Create comment
    const comment = new Comment({
      docId,
      user: userId,
      content: content.trim(),
      parentId: parentId || null, // NEW: Lưu parentId
      likes: [],
    });

    await comment.save();

    // Increment comment count in Document
    await Document.findByIdAndUpdate(docId, {
      $inc: { commentCount: 1 },
    });

    // Populate user info for response
    await comment.populate("user", "name avatarUrl role");

    res.status(201).json({
      status: "success",
      code: 201,
      message: parentId
        ? "Trả lời bình luận thành công"
        : "Gửi bình luận thành công",
      data: {
        comment,
      },
    });
  } catch (error) {
    console.error("Add comment error:", error);

    // Mongoose validation error
    if (error.name === "ValidationError") {
      const errors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }));

      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors,
      });
    }

    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi gửi bình luận",
    });
  }
};

/* API 3.2 – Lấy danh sách bình luận của tài liệu (Flat Array)
 * @route GET /api/comments/document/:docId
 * @param {string} docId - ID của tài liệu
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng bình luận trên mỗi trang
 * @returns {Promise<Object>} - Danh sách bình luận (flat array) và thông tin phân trang
 *
 * NOTE: Trả về flat array, Frontend sẽ tự group theo parentId
 */
exports.getCommentsByDocId = async (req, res) => {
  try {
    const { docId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Tăng limit để lấy cả replies

    // Check if document exists
    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    // Count total comments (cả root và replies)
    const totalComments = await Comment.countDocuments({
      docId,
      isDeleted: false,
    });

    // Count root comments only (để phân trang chính xác)
    const totalRootComments = await Comment.countDocuments({
      docId,
      parentId: null,
      isDeleted: false,
    });

    // STRATEGY: Lấy tất cả comments của docId (flat array)
    // Frontend sẽ tự group theo parentId
    // Sort: Root comments theo createdAt DESC, replies theo createdAt ASC (oldest first)
    const comments = await Comment.find({ docId, isDeleted: false })
      .populate("user", "name avatarUrl role")
      .sort({ parentId: 1, createdAt: -1 }) // null parentId first, then by date
      .lean();

    // Re-sort để root comments mới nhất lên trước, replies cũ nhất lên trước
    const rootComments = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    // Sort root comments: newest first
    rootComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Sort replies: oldest first (để đọc theo thứ tự thời gian)
    replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Combine: root comments + replies
    const sortedComments = [...rootComments, ...replies];

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách bình luận thành công",
      data: {
        comments: sortedComments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalRootComments / limit),
          totalComments,
          totalRootComments,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy danh sách bình luận",
    });
  }
};

/* API 3.3 – Cập nhật bình luận (User)
 * @route PUT /api/comments/:id
 * @param {string} id - ID của bình luận cần cập nhật
 * @param {string} content - Nội dung mới của bình luận
 * @returns {Promise<void>}
 */
exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id.toString();

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Nội dung bình luận không được để trống",
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Nội dung bình luận không được vượt quá 500 ký tự",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy bình luận",
      });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền chỉnh sửa bình luận này",
      });
    }

    comment.content = content.trim();
    await comment.save();

    // Populate user info
    await comment.populate("user", "name avatarUrl role");

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Cập nhật bình luận thành công",
      data: { comment },
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(400).json({
      status: "error",
      code: 400,
      message: error.message || "Lỗi khi cập nhật bình luận",
    });
  }
};

/** API 3.4 & 3.5 – Xóa bình luận (Owner/Admin)
 * @route DELETE /api/comments/:id
 * @param {string} id - ID của bình luận cần xóa
 *
 * NOTE: Khi xóa comment cha, tất cả replies cũng sẽ bị xóa
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find comment
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy bình luận",
      });
    }

    // Check permission - Owner or Admin
    if (comment.user.toString() !== userId.toString() && userRole !== "Admin") {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền xóa bình luận này",
      });
    }

    // Đếm số replies sẽ bị xóa (nếu là root comment)
    let deletedCount = 1;

    if (!comment.parentId) {
      // Đây là root comment -> Xóa luôn tất cả replies
      const repliesResult = await Comment.deleteMany({ parentId: id });
      deletedCount += repliesResult.deletedCount;
    }

    // Delete the comment itself
    await Comment.findByIdAndDelete(id);

    // Decrement comment count (bao gồm cả replies đã xóa)
    await Document.findByIdAndUpdate(comment.docId, {
      $inc: { commentCount: -deletedCount },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message:
        deletedCount > 1
          ? `Đã xóa bình luận và ${deletedCount - 1} phản hồi`
          : "Xóa bình luận thành công",
      data: {
        deletedCount,
      },
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi xóa bình luận",
    });
  }
};

/** API 3.6 – Toggle Like bình luận
 * @route POST /api/comments/:id/like
 * @param {string} id - ID của bình luận
 * @returns {Promise<Object>} - Trạng thái like mới và số lượng likes
 */
exports.toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find comment
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy bình luận",
      });
    }

    // Check if comment is deleted
    if (comment.isDeleted) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Bình luận này đã bị xóa",
      });
    }

    // Check if user already liked
    const likeIndex = comment.likes.findIndex(
      (likeUserId) => likeUserId.toString() === userId.toString(),
    );

    let isLiked;

    if (likeIndex === -1) {
      // User chưa like -> Thêm like
      comment.likes.push(userId);
      isLiked = true;
    } else {
      // User đã like -> Bỏ like
      comment.likes.splice(likeIndex, 1);
      isLiked = false;
    }

    // Save comment
    await comment.save();

    res.status(200).json({
      status: "success",
      code: 200,
      message: isLiked ? "Đã thích bình luận" : "Đã bỏ thích bình luận",
      data: {
        isLiked,
        likeCount: comment.likes.length,
        likes: comment.likes,
      },
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi thực hiện thao tác",
    });
  }
};
