const EditRequest = require("../models/editRequest.model");
const Document = require("../models/document.model");
const Notification = require("../models/notification.model");
const Category = require("../models/category.model");
const { getFileUrl, deleteFile } = require("../middleware/upload.middleware");

/**
 * API: Lấy danh sách yêu cầu chỉnh sửa tài liệu
 * GET /api/admin/edit-requests
 * Access: Admin
 */
const getEditRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [requests, total] = await Promise.all([
      EditRequest.find(query)
        .populate("document", "title status fileFormat")
        .populate("author", "name email avatarUrl")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      EditRequest.countDocuments(query),
    ]);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách yêu cầu chỉnh sửa thành công",
      data: {
        requests,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalRequests: total,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Get edit requests error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy danh sách yêu cầu",
    });
  }
};

/**
 * API: Admin duyệt hoặc từ chối yêu cầu chỉnh sửa
 * PUT /api/admin/edit-requests/:reqId/review
 * Access: Admin
 *
 * Nếu approved: Đổi status Document về 'pending' -> Author có thể tự sửa
 * Nếu rejected: Chỉ update request, gửi thông báo
 */
const reviewEditRequest = async (req, res) => {
  try {
    const { reqId } = req.params;
    const { status, adminReason } = req.body;
    const adminId = req.user.id;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message:
          "Trạng thái không hợp lệ. Chỉ chấp nhận 'approved' hoặc 'rejected'",
      });
    }

    if (status === "rejected" && !adminReason?.trim()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Lý do từ chối là bắt buộc",
      });
    }

    const editRequest = await EditRequest.findById(reqId).populate(
      "document",
      "title status uploadedBy",
    );

    if (!editRequest) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy yêu cầu chỉnh sửa",
      });
    }

    if (editRequest.status !== "pending") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: `Yêu cầu này đã được ${
          editRequest.status === "approved" ? "chấp thuận" : "từ chối"
        } trước đó`,
      });
    }

    // Update request
    editRequest.status = status;
    editRequest.reviewedBy = adminId;
    editRequest.reviewedAt = new Date();
    if (status === "rejected") {
      editRequest.adminReason = adminReason.trim();
    }
    await editRequest.save();

    // Nếu approved -> đổi document status về pending để Author có thể sửa
    if (status === "approved" && editRequest.document) {
      await Document.findByIdAndUpdate(editRequest.document._id, {
        status: "pending",
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      });
    }

    // Gửi notification
    try {
      const notificationData = {
        recipient: editRequest.author,
        type: "UPGRADE_REQUEST",
        actionBy: adminId,
      };

      if (status === "approved") {
        notificationData.title = "Yêu cầu chỉnh sửa được chấp thuận ✅";
        notificationData.message = `Yêu cầu chỉnh sửa tài liệu "${editRequest.document?.title}" của bạn đã được chấp thuận. Tài liệu đã chuyển sang "Chờ duyệt", bạn có thể sửa ngay bây giờ.`;
      } else {
        notificationData.title = "Yêu cầu chỉnh sửa bị từ chối ❌";
        notificationData.message = `Yêu cầu chỉnh sửa tài liệu "${editRequest.document?.title}" đã bị từ chối. Lý do: ${adminReason.trim()}`;
      }

      await Notification.create(notificationData);
    } catch (notifErr) {
      console.error(
        "[Notification] Edit request notification failed:",
        notifErr,
      );
    }

    await editRequest.populate("reviewedBy", "name email");

    return res.status(200).json({
      status: "success",
      code: 200,
      message:
        status === "approved"
          ? "Đã chấp thuận yêu cầu. Tài liệu đã chuyển về trạng thái chờ duyệt."
          : "Đã từ chối yêu cầu chỉnh sửa",
      data: { editRequest },
    });
  } catch (error) {
    console.error("Review edit request error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi xử lý yêu cầu",
    });
  }
};

/**
 * API: Admin sửa trực tiếp tài liệu (bỏ qua ràng buộc status)
 * PUT /api/admin/documents/:id/direct-edit
 * Access: Admin ONLY
 *
 * SAFEGUARD: Frontend phải truyền safeguardConfirmed: true
 */
const adminDirectEdit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      safeguardConfirmed,
      title,
      description,
      author,
      englishTitle,
      isbn,
      publisher,
      publishYear,
      category,
      language,
    } = req.body;

    // Kiểm tra safeguard flag
    if (!safeguardConfirmed) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Thiếu xác nhận an toàn. Vui lòng nhập chuỗi xác nhận.",
      });
    }

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    const oldCategoryId = document.categoryId?.toString();

    if (title) document.title = title.trim();
    if (description !== undefined) document.description = description.trim();
    if (author !== undefined) document.author = author ? author.trim() : null;
    if (englishTitle !== undefined)
      document.englishTitle = englishTitle ? englishTitle.trim() : "";
    if (isbn !== undefined) document.isbn = isbn ? isbn.trim() : "";
    if (publisher !== undefined)
      document.publisher = publisher ? publisher.trim() : null;
    if (publishYear !== undefined)
      document.publishYear = publishYear ? parseInt(publishYear) : null;
    if (language !== undefined)
      document.documentLanguage = language || "Tiếng Việt";

    if (category && category !== oldCategoryId) {
      if (oldCategoryId) {
        await Category.findByIdAndUpdate(oldCategoryId, {
          $inc: { documentCount: -1 },
        });
      }
      await Category.findByIdAndUpdate(category, {
        $inc: { documentCount: 1 },
      });
      document.categoryId = category;
    }

    if (req.file) {
      if (document.fileUrl) {
        await deleteFile(document.fileUrl);
      }
      let fileFormat = "pdf";
      if (req.file.mimetype === "application/epub+zip") {
        fileFormat = "epub";
      }
      document.fileUrl = getFileUrl(req.file);
      document.fileName = req.file.originalname;
      document.fileSize = req.file.size;
      document.fileFormat = fileFormat;
    }

    // Admin direct edit KHÔNG đổi status
    await document.save();
    await document.populate("categoryId", "name slug");
    await document.populate("uploadedBy", "name email role");

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Admin đã cập nhật tài liệu thành công",
      data: {
        document: {
          id: document._id,
          title: document.title,
          description: document.description,
          author: document.author,
          englishTitle: document.englishTitle,
          isbn: document.isbn,
          publisher: document.publisher,
          publishYear: document.publishYear,
          language: document.documentLanguage,
          category: document.categoryId
            ? {
                id: document.categoryId._id,
                name: document.categoryId.name,
                slug: document.categoryId.slug,
              }
            : null,
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          fileSize: document.fileSize,
          fileFormat: document.fileFormat,
          status: document.status,
          updatedAt: document.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Admin direct edit error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi cập nhật tài liệu",
    });
  }
};

module.exports = {
  getEditRequests,
  reviewEditRequest,
  adminDirectEdit,
};
