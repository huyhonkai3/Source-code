const Comment = require("../models/comment.model");
const Document = require("../models/document.model");

/* API 3.1 – Thêm bình luận mới
 * @route POST /api/documents/:id/comments
 * @param {string} id - ID của tài liệu
 * @param {string} content - Nội dung bình luận
 * @returns {object} - Thông tin bình luận mới
 */
exports.addComment = async (req, res) => {
  try {
    const { docId, content } = req.body;
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

    // Create comment
    const comment = new Comment({
      docId,
      user: userId,
      content: content.trim(),
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
      message: "Gửi bình luận thành công",
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

/* API 3.2 – Lấy danh sách bình luận của tài liệu
 * @route GET /api/documents/:id/comments
 * @param {string} docId - ID của tài liệu
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số lượng bình luận trên mỗi trang
 * @returns {Promise<Object>} - Danh sách bình luận và thông tin phân trang
 */
exports.getCommentsByDocId = async (req, res) => {
  try {
    const { docId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if document exists
    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    // Count total comments
    const totalComments = await Comment.countDocuments({
      docId,
      isDeleted: false,
    });

    // Fetch comments
    const comments = await Comment.find({ docId, isDeleted: false })
      .populate("user", "name avatarUrl role")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách bình luận thành công",
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
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
    comment.content = content;
    await comment.save();
    res.status(200).json({
      status: "success",
      code: 200,
      message: "Cập nhật bình luận thành công",
      data: { comment },
    });
  } catch (error) {
    res
      .status(400)
      .json({ status: "error", code: 400, message: error.message });
  }
};

/** API 3.4 & 3.5 – Xóa bình luận (Owner/Admin)
 * @route DELETE /api/comments/:id
 * @param {string} id - ID của bình luận cần xóa
 * @param {string} userId - ID của người dùng hiện tại
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

    // Delete comment
    await Comment.findByIdAndDelete(id);

    // Decrement comment count
    await Document.findByIdAndUpdate(comment.docId, {
      $inc: { commentCount: -1 },
    });

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Xóa bình luận thành công",
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
