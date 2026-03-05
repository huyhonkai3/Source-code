const Report = require("../models/report.model");
const Document = require("../models/document.model");
const Notification = require("../models/notification.model");

/**
 * Report Controller - Notice & Takedown System
 * Xử lý các báo cáo vi phạm bản quyền / nội dung
 */

/**
 * POST /api/reports
 * Người dùng gửi báo cáo vi phạm cho một tài liệu
 * Access: Authenticated users (User, Author, Moderator, Admin)
 */
const createReport = async (req, res) => {
  try {
    const { documentId, reason, description } = req.body;
    const reporterId = req.user.id;

    // ==================== VALIDATIONS ====================

    if (!documentId) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "ID tài liệu là bắt buộc",
        errors: [
          { field: "documentId", message: "Vui lòng cung cấp ID tài liệu" },
        ],
      });
    }

    const validReasons = [
      "COPYRIGHT_INFRINGEMENT",
      "INAPPROPRIATE_CONTENT",
      "WRONG_CATEGORY",
      "SPAM",
      "OTHER",
    ];
    if (!reason || !validReasons.includes(reason)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Lý do báo cáo không hợp lệ",
        errors: [
          {
            field: "reason",
            message: "Vui lòng chọn lý do báo cáo hợp lệ",
          },
        ],
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

    // Không cho phép báo cáo tài liệu của chính mình
    if (document.uploadedBy.toString() === reporterId) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không thể báo cáo tài liệu của chính mình",
      });
    }

    // Kiểm tra đã báo cáo tài liệu này chưa (tránh spam report)
    const existingReport = await Report.findOne({
      document: documentId,
      reporter: reporterId,
      status: "PENDING",
    });

    if (existingReport) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Bạn đã gửi báo cáo cho tài liệu này và đang chờ xử lý",
      });
    }

    // ==================== TẠO REPORT ====================

    const report = await Report.create({
      document: documentId,
      reporter: reporterId,
      reason,
      description: description ? description.trim() : "",
      status: "PENDING",
    });

    // ==================== ẨN TÀI LIỆU (HIDDEN) ====================
    // Tài liệu bị ẩn ngay lập tức khi có báo cáo vi phạm bản quyền
    // Với các lý do khác, chỉ ghi nhận báo cáo, không ẩn ngay
    if (reason === "COPYRIGHT_INFRINGEMENT") {
      await Document.findByIdAndUpdate(documentId, {
        status: "hidden",
      });
    }

    // Populate để trả về response
    await report.populate("document", "title");
    await report.populate("reporter", "name email");

    return res.status(201).json({
      status: "success",
      code: 201,
      message:
        reason === "COPYRIGHT_INFRINGEMENT"
          ? "Báo cáo vi phạm bản quyền đã được ghi nhận. Tài liệu đã bị tạm ẩn và chờ Admin xét duyệt."
          : "Báo cáo của bạn đã được ghi nhận và sẽ được Admin xem xét.",
      data: {
        report: {
          id: report._id,
          document: {
            id: report.document._id,
            title: report.document.title,
          },
          reporter: {
            id: report.reporter._id,
            name: report.reporter.name,
          },
          reason,
          reasonLabel: Report.REASON_LABELS[reason] || reason,
          description: report.description,
          status: report.status,
          createdAt: report.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create report error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi gửi báo cáo",
    });
  }
};

/**
 * GET /api/reports
 * Admin lấy danh sách báo cáo
 * Access: Admin, Moderator
 */
const getReports = async (req, res) => {
  try {
    const { status = "PENDING", page = 1, limit = 10, reason } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (reason) {
      query.reason = reason;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("document", "title fileUrl fileFormat status uploadedBy")
        .populate("reporter", "name email")
        .populate("resolvedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Report.countDocuments(query),
    ]);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách báo cáo thành công",
      data: {
        reports: reports.map((r) => ({
          id: r._id,
          document: r.document
            ? {
                id: r.document._id,
                title: r.document.title,
                status: r.document.status,
                fileFormat: r.document.fileFormat,
              }
            : null,
          reporter: r.reporter
            ? {
                id: r.reporter._id,
                name: r.reporter.name,
                email: r.reporter.email,
              }
            : null,
          reason: r.reason,
          reasonLabel: Report.REASON_LABELS[r.reason] || r.reason,
          description: r.description,
          status: r.status,
          resolvedBy: r.resolvedBy
            ? { id: r.resolvedBy._id, name: r.resolvedBy.name }
            : null,
          resolvedAt: r.resolvedAt,
          adminNote: r.adminNote,
          createdAt: r.createdAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy danh sách báo cáo",
    });
  }
};

/**
 * PATCH /api/reports/:id/resolve
 * Admin xử lý báo cáo
 * Access: Admin
 *
 * action:
 *   - "DELETE_DOCUMENT": Xóa tài liệu vi phạm (giải quyết report)
 *   - "RESTORE_DOCUMENT": Bác bỏ báo cáo, khôi phục tài liệu về approved
 */
const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, adminNote } = req.body;
    const adminId = req.user.id;

    const validActions = ["DELETE_DOCUMENT", "RESTORE_DOCUMENT"];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Hành động không hợp lệ",
        errors: [
          {
            field: "action",
            message: "action phải là DELETE_DOCUMENT hoặc RESTORE_DOCUMENT",
          },
        ],
      });
    }

    const report = await Report.findById(id).populate("document");
    if (!report) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy báo cáo",
      });
    }

    if (report.status !== "PENDING") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Báo cáo này đã được xử lý trước đó",
      });
    }

    const document = report.document;

    if (action === "DELETE_DOCUMENT") {
      // Xóa tài liệu vi phạm
      if (document) {
        const { deleteFile } = require("../middleware/upload.middleware");
        await deleteFile(document.fileUrl);
        if (document.authorizationFileUrl) {
          await deleteFile(document.authorizationFileUrl);
        }

        const Category = require("../models/category.model");
        await Category.findByIdAndUpdate(document.categoryId, {
          $inc: { documentCount: -1 },
        });

        await Document.findByIdAndDelete(document._id);
      }

      // Cập nhật tất cả report cùng tài liệu này sang RESOLVED
      await Report.updateMany(
        { document: document?._id, status: "PENDING" },
        {
          status: "RESOLVED",
          resolvedBy: adminId,
          resolvedAt: new Date(),
          adminNote: adminNote || "Tài liệu đã bị xóa do vi phạm",
        },
      );

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Đã xóa tài liệu vi phạm và đóng báo cáo",
      });
    }

    if (action === "RESTORE_DOCUMENT") {
      // Bác bỏ báo cáo, khôi phục tài liệu về approved
      if (document) {
        await Document.findByIdAndUpdate(document._id, { status: "approved" });
      }

      // Đóng báo cáo hiện tại
      await Report.findByIdAndUpdate(id, {
        status: "REJECTED",
        resolvedBy: adminId,
        resolvedAt: new Date(),
        adminNote: adminNote || "Báo cáo không hợp lệ, tài liệu được khôi phục",
      });

      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Đã bác bỏ báo cáo và khôi phục tài liệu",
      });
    }
  } catch (error) {
    console.error("Resolve report error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi xử lý báo cáo",
    });
  }
};

/**
 * GET /api/reports/admin
 * Admin lấy tất cả báo cáo (sort mới nhất, PENDING ưu tiên)
 * Access: Admin only
 */
const getAdminReports = async (req, res) => {
  try {
    const { status, reason, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== "all") query.status = status;
    if (reason) query.reason = reason;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate("document", "title status uploadedBy fileFormat")
        .populate("reporter", "name email avatarUrl")
        .populate("resolvedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Report.countDocuments(query),
    ]);

    const pendingCount = await Report.countDocuments({ status: "PENDING" });

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách báo cáo thành công",
      data: {
        reports: reports.map((r) => ({
          id: r._id,
          document: r.document
            ? {
                id: r.document._id,
                title: r.document.title,
                status: r.document.status,
                fileFormat: r.document.fileFormat,
                uploadedBy: r.document.uploadedBy,
              }
            : null,
          reporter: r.reporter
            ? {
                id: r.reporter._id,
                name: r.reporter.name,
                email: r.reporter.email,
                avatarUrl: r.reporter.avatarUrl || null,
              }
            : null,
          reason: r.reason,
          reasonLabel: Report.REASON_LABELS?.[r.reason] || r.reason,
          description: r.description,
          status: r.status,
          resolvedBy: r.resolvedBy
            ? { id: r.resolvedBy._id, name: r.resolvedBy.name }
            : null,
          resolvedAt: r.resolvedAt,
          adminNote: r.adminNote,
          createdAt: r.createdAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          total,
          limit: limitNum,
        },
        pendingCount,
      },
    });
  } catch (error) {
    console.error("getAdminReports error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy danh sách báo cáo",
    });
  }
};

/**
 * PATCH /api/reports/:id/resolve
 * Admin đồng ý với báo cáo -> Gỡ bỏ tài liệu vi phạm
 * Access: Admin only
 * Body: { adminNote? }
 */
const resolveReportAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const adminId = req.user.id;

    const report = await Report.findById(id).populate({
      path: "document",
      populate: { path: "uploadedBy", select: "name email" },
    });

    if (!report) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy báo cáo",
      });
    }

    if (report.status !== "PENDING") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Báo cáo này đã được xử lý trước đó",
      });
    }

    const document = report.document;

    // Cập nhật document status sang REJECTED
    if (document) {
      await Document.findByIdAndUpdate(document._id, { status: "rejected" });

      // Gửi thông báo cho tác giả tài liệu
      if (document.uploadedBy) {
        await Notification.create({
          recipient: document.uploadedBy._id || document.uploadedBy,
          title: "Tài liệu của bạn bị gỡ bỏ",
          message: `Tài liệu "${document.title}" đã bị gỡ bỏ do vi phạm quy định sau khi được Admin xem xét báo cáo.${adminNote ? ` Ghi chú: ${adminNote}` : ""}`,
          type: "DOCUMENT_REJECTED",
          relatedDocument: document._id,
          actionBy: adminId,
        });
      }
    }

    // Cập nhật report status
    await Report.findByIdAndUpdate(id, {
      status: "RESOLVED",
      resolvedBy: adminId,
      resolvedAt: new Date(),
      adminNote: adminNote || "Admin đã xác nhận vi phạm và gỡ bỏ tài liệu",
    });

    return res.status(200).json({
      status: "success",
      code: 200,
      message:
        "Đã xử lý báo cáo: tài liệu bị gỡ bỏ và tác giả đã được thông báo",
    });
  } catch (error) {
    console.error("resolveReportAdmin error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi xử lý báo cáo",
    });
  }
};

/**
 * PATCH /api/reports/:id/reject
 * Admin bác bỏ báo cáo -> Khôi phục tài liệu
 * Access: Admin only
 * Body: { adminNote? }
 */
const rejectReportAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
    const adminId = req.user.id;

    const report = await Report.findById(id).populate(
      "document",
      "title status",
    );

    if (!report) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy báo cáo",
      });
    }

    if (report.status !== "PENDING") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Báo cáo này đã được xử lý trước đó",
      });
    }

    // Khôi phục document về approved
    if (report.document) {
      await Document.findByIdAndUpdate(report.document._id, {
        status: "approved",
      });
    }

    // Cập nhật report status
    await Report.findByIdAndUpdate(id, {
      status: "REJECTED",
      resolvedBy: adminId,
      resolvedAt: new Date(),
      adminNote: adminNote || "Báo cáo không hợp lệ, tài liệu được khôi phục",
    });

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Đã bác bỏ báo cáo và khôi phục tài liệu",
    });
  } catch (error) {
    console.error("rejectReportAdmin error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi bác bỏ báo cáo",
    });
  }
};

module.exports = {
  createReport,
  getReports,
  resolveReport,
  getAdminReports,
  resolveReportAdmin,
  rejectReportAdmin,
};
