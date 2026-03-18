const Bookmark = require("../models/bookmark.model");
const Document = require("../models/document.model");

/**
 * POST /api/bookmarks
 * Lưu hoặc cập nhật vị trí đọc (upsert)
 * Access: Authenticated users
 * Body: { documentId, position }
 */
const saveBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId, position } = req.body;

    if (!documentId || !position) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "documentId và position là bắt buộc",
      });
    }

    // Kiểm tra tài liệu tồn tại
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    // Upsert: tạo mới nếu chưa có, cập nhật nếu đã có
    const bookmark = await Bookmark.findOneAndUpdate(
      { user: userId, document: documentId },
      { position: String(position) },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Đã lưu vị trí đọc",
      data: {
        bookmark: {
          id: bookmark._id,
          documentId: bookmark.document,
          position: bookmark.position,
          updatedAt: bookmark.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("saveBookmark error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lưu bookmark",
    });
  }
};

/**
 * GET /api/bookmarks/:documentId
 * Lấy vị trí đọc của user cho tài liệu cụ thể
 * Access: Authenticated users
 */
const getBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentId } = req.params;

    const bookmark = await Bookmark.findOne({
      user: userId,
      document: documentId,
    });

    if (!bookmark) {
      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Chưa có bookmark cho tài liệu này",
        data: { bookmark: null },
      });
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy bookmark thành công",
      data: {
        bookmark: {
          id: bookmark._id,
          documentId: bookmark.document,
          position: bookmark.position,
          updatedAt: bookmark.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("getBookmark error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy bookmark",
    });
  }
};

module.exports = { saveBookmark, getBookmark };
