const Document = require("../models/document.model");
const Category = require("../models/category.model");
const Statistic = require("../models/statistics.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

/**
 * API 2.5: Tải lên tài liệu (F6)
 * POST /api/documents/upload
 * Access: Author, Admin
 *
 * Hỗ trợ định dạng: PDF, EPUB
 */
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "File tải lên là bắt buộc",
        errors: [
          {
            field: "file",
            message: "Vui lòng chọn file PDF hoặc EPUB để tải lên",
          },
        ],
      });
    }

    const { title, description, category, author, publisher, publishYear } =
      req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [
          {
            field: "title",
            message: "Tiêu đề tài liệu là bắt buộc",
          },
        ],
      });
    }

    if (!category) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [
          {
            field: "category",
            message: "Danh mục là bắt buộc",
          },
        ],
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy danh mục",
      });
    }

    // Xác định file format dựa trên mimetype
    let fileFormat = "pdf"; // Default
    if (req.file.mimetype === "application/epub+zip") {
      fileFormat = "epub";
    } else if (req.file.mimetype === "application/pdf") {
      fileFormat = "pdf";
    }

    const newDocument = new Document({
      title: title.trim(),
      description: description ? description.trim() : "",
      author: author ? author.trim() : null,
      publisher: publisher ? publisher.trim() : null,
      publishYear: publishYear ? parseInt(publishYear) : null,
      categoryId: category,
      uploadedBy: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileFormat: fileFormat,
      status: "pending",
    });

    const savedDocument = await newDocument.save();

    await Category.findByIdAndUpdate(category, {
      $inc: { documentCount: 1 },
    });

    const populatedDoc = await Document.findById(savedDocument._id)
      .populate("uploadedBy", "name email role")
      .populate("categoryId", "name slug");

    return res.status(201).json({
      status: "success",
      code: 201,
      message: "Tải lên tài liệu thành công. Tài liệu đang chờ kiểm duyệt.",
      data: {
        document: {
          id: populatedDoc._id,
          title: populatedDoc.title,
          description: populatedDoc.description,
          author: populatedDoc.author,
          publisher: populatedDoc.publisher,
          publishYear: populatedDoc.publishYear,
          category: {
            id: populatedDoc.categoryId._id,
            name: populatedDoc.categoryId.name,
            slug: populatedDoc.categoryId.slug,
          },
          uploadedBy: {
            id: populatedDoc.uploadedBy._id,
            name: populatedDoc.uploadedBy.name,
            email: populatedDoc.uploadedBy.email,
            role: populatedDoc.uploadedBy.role,
          },
          fileUrl: populatedDoc.fileUrl,
          fileName: populatedDoc.fileName,
          fileSize: populatedDoc.fileSize,
          fileFormat: populatedDoc.fileFormat,
          status: populatedDoc.status,
          views: populatedDoc.views,
          downloads: populatedDoc.downloads,
          createdAt: populatedDoc.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Upload document error:", error);

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

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi tải lên tài liệu",
    });
  }
};

/**
 * API 2.6: Kiểm duyệt tài liệu (F7)
 * PUT /api/admin/documents/:id/status
 * Access: Admin, Moderator
 */
const reviewDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const reviewerId = req.user.id;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [
          {
            field: "status",
            message: "Trạng thái phải là 'approved' hoặc 'rejected'",
          },
        ],
      });
    }

    if (status === "rejected" && (!reason || !reason.trim())) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [
          {
            field: "reason",
            message: "Lý do từ chối là bắt buộc khi trạng thái là 'rejected'",
          },
        ],
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

    if (document.status !== "pending") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Tài liệu này đã được xử lý trước đó",
      });
    }

    document.status = status;
    document.reviewedBy = reviewerId;
    document.reviewedAt = new Date();

    if (status === "rejected") {
      document.rejectionReason = reason.trim();
    } else {
      document.rejectionReason = null;
    }

    await document.save();

    await document.populate("reviewedBy", "name email role");
    await document.populate("categoryId", "name slug");
    await document.populate("uploadedBy", "name email role");

    return res.status(200).json({
      status: "success",
      code: 200,
      message:
        status === "approved"
          ? "Duyệt tài liệu thành công"
          : "Từ chối tài liệu thành công",
      data: {
        document: {
          id: document._id,
          title: document.title,
          description: document.description,
          author: document.author,
          publisher: document.publisher,
          publishYear: document.publishYear,
          category: {
            id: document.categoryId._id,
            name: document.categoryId.name,
            slug: document.categoryId.slug,
          },
          uploadedBy: {
            id: document.uploadedBy._id,
            name: document.uploadedBy.name,
            email: document.uploadedBy.email,
            role: document.uploadedBy.role,
          },
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          fileSize: document.fileSize,
          fileFormat: document.fileFormat,
          status: document.status,
          rejectionReason: document.rejectionReason,
          reviewedBy: document.reviewedBy
            ? {
                id: document.reviewedBy._id,
                name: document.reviewedBy.name,
                email: document.reviewedBy.email,
                role: document.reviewedBy.role,
              }
            : null,
          reviewedAt: document.reviewedAt,
          views: document.views,
          downloads: document.downloads,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Review document error:", error);

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi kiểm duyệt tài liệu",
    });
  }
};

/**
 * API 2.7 & 2.8: Lấy danh sách tài liệu
 * GET /api/documents (Public - API 2.7)
 * GET /api/admin/documents (Admin - API 2.8)
 */
const getDocuments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      sort = "-createdAt",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (!req.originalUrl.includes("/admin")) {
      query.status = "approved";
    } else if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
      ];
    }

    let categoryId = category;
    if (req.query["category[]"]) {
      categoryId = req.query["category[]"];
    }

    if (categoryId) {
      if (Array.isArray(categoryId)) {
        query.categoryId = { $in: categoryId };
      } else {
        query.categoryId = categoryId;
      }
    }

    const [documents, totalDocs] = await Promise.all([
      Document.find(query)
        .populate("categoryId", "name slug")
        .populate("uploadedBy", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Document.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách tài liệu thành công",
      data: {
        documents: documents.map((doc) => ({
          id: doc._id,
          title: doc.title,
          description: doc.description,
          author: doc.author,
          publisher: doc.publisher,
          publishYear: doc.publishYear,
          category: doc.categoryId
            ? {
                id: doc.categoryId._id,
                name: doc.categoryId.name,
                slug: doc.categoryId.slug,
              }
            : null,
          uploadedBy: doc.uploadedBy
            ? {
                id: doc.uploadedBy._id,
                name: doc.uploadedBy.name,
                email: doc.uploadedBy.email,
              }
            : null,
          fileUrl: doc.fileUrl,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          fileFormat: doc.fileFormat,
          coverImage: doc.coverImage,
          status: doc.status,
          views: doc.views,
          downloads: doc.downloads,
          rating: doc.rating,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDocs,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy danh sách tài liệu",
    });
  }
};

/**
 * API: Lấy tài liệu của tác giả hiện tại
 * GET /api/documents/my-documents
 * Access: Author, Admin
 */
const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, sort = "-createdAt" } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { uploadedBy: userId };

    if (status) {
      query.status = status;
    }

    const [documents, totalDocs] = await Promise.all([
      Document.find(query)
        .populate("categoryId", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(limitNum),
      Document.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum);

    const stats = await Document.aggregate([
      { $match: { uploadedBy: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsObj = {
      total: totalDocs,
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((s) => {
      statsObj[s._id] = s.count;
    });

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách tài liệu thành công",
      data: {
        documents: documents.map((doc) => ({
          id: doc._id,
          title: doc.title,
          description: doc.description,
          author: doc.author,
          category: doc.categoryId
            ? {
                id: doc.categoryId._id,
                name: doc.categoryId.name,
                slug: doc.categoryId.slug,
              }
            : null,
          fileName: doc.fileName,
          fileSize: doc.fileSize,
          fileFormat: doc.fileFormat,
          status: doc.status,
          rejectionReason: doc.rejectionReason,
          views: doc.views,
          downloads: doc.downloads,
          createdAt: doc.createdAt,
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalDocs,
          limit: limitNum,
        },
        stats: statsObj,
      },
    });
  } catch (error) {
    console.error("Get my documents error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy danh sách tài liệu",
    });
  }
};

/**
 * API 2.9: Lấy chi tiết tài liệu
 * GET /api/documents/:id
 * Access: Public (có phân quyền)
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const document = await Document.findById(id)
      .populate("categoryId", "name slug")
      .populate("uploadedBy", "name email role")
      .populate("reviewedBy", "name email role");

    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    const isAdminOrModerator = ["Admin", "Moderator"].includes(userRole);
    const isOwner = document.uploadedBy?._id?.toString() === userId;
    const isApproved = document.status === "approved";

    if (!isAdminOrModerator && !isOwner && !isApproved) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền xem tài liệu này",
      });
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy chi tiết tài liệu thành công",
      data: {
        document: {
          id: document._id,
          title: document.title,
          description: document.description,
          author: document.author,
          publisher: document.publisher,
          publishYear: document.publishYear,
          pageCount: document.pageCount,
          category: document.categoryId
            ? {
                id: document.categoryId._id,
                name: document.categoryId.name,
                slug: document.categoryId.slug,
              }
            : null,
          uploadedBy: document.uploadedBy
            ? {
                id: document.uploadedBy._id,
                name: document.uploadedBy.name,
                email: document.uploadedBy.email,
                role: document.uploadedBy.role,
              }
            : null,
          fileUrl: document.fileUrl,
          fileName: document.fileName,
          fileSize: document.fileSize,
          fileFormat: document.fileFormat,
          coverImage: document.coverImage,
          status: document.status,
          rejectionReason: document.rejectionReason,
          reviewedBy: document.reviewedBy
            ? {
                id: document.reviewedBy._id,
                name: document.reviewedBy.name,
              }
            : null,
          reviewedAt: document.reviewedAt,
          views: document.views,
          downloads: document.downloads,
          rating: document.rating,
          commentCount: document.commentCount,
          wikidataInfo: document.wikidataInfo,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get document by id error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy chi tiết tài liệu",
    });
  }
};

/**
 * API 2.10: Cập nhật tài liệu
 * PUT /api/documents/:id
 * Access: Author (owner), Admin
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    const isOwner = document.uploadedBy.toString() === userId;
    const isAdmin = userRole === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền cập nhật tài liệu này",
      });
    }

    const allowedUpdates = [
      "title",
      "description",
      "author",
      "publisher",
      "publishYear",
    ];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(404).json({
          status: "error",
          code: 404,
          message: "Không tìm thấy danh mục",
        });
      }
      updates.categoryId = req.body.category;
    }

    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true },
    )
      .populate("categoryId", "name slug")
      .populate("uploadedBy", "name email role");

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Cập nhật tài liệu thành công",
      data: {
        document: {
          id: updatedDocument._id,
          title: updatedDocument.title,
          description: updatedDocument.description,
          author: updatedDocument.author,
          publisher: updatedDocument.publisher,
          publishYear: updatedDocument.publishYear,
          category: updatedDocument.categoryId
            ? {
                id: updatedDocument.categoryId._id,
                name: updatedDocument.categoryId.name,
                slug: updatedDocument.categoryId.slug,
              }
            : null,
          fileFormat: updatedDocument.fileFormat,
          status: updatedDocument.status,
          updatedAt: updatedDocument.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update document error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi cập nhật tài liệu",
    });
  }
};

/**
 * API 2.11: Xóa tài liệu
 * DELETE /api/documents/:id
 * Access: Author (owner), Admin
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    const isOwner = document.uploadedBy.toString() === userId;
    const isAdmin = userRole === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền xóa tài liệu này",
      });
    }

    const filePath = path.join(process.cwd(), document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Category.findByIdAndUpdate(document.categoryId, {
      $inc: { documentCount: -1 },
    });

    await Document.findByIdAndDelete(id);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Xóa tài liệu thành công",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi xóa tài liệu",
    });
  }
};

/**
 * API: Tải xuống tài liệu
 * GET /api/documents/:id/download
 * Access: Authenticated users
 */
const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    const isAdminOrModerator = ["Admin", "Moderator"].includes(userRole);
    const isOwner = document.uploadedBy?.toString() === userId;
    const isApproved = document.status === "approved";

    if (!isAdminOrModerator && !isOwner && !isApproved) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền tải tài liệu này",
      });
    }

    const filePath = path.join(process.cwd(), document.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "File không tồn tại trên server",
      });
    }

    let contentType = "application/pdf";
    if (document.fileFormat === "epub") {
      contentType = "application/epub+zip";
    }

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on("error", (error) => {
      console.error("Stream error:", error);
      if (!res.headersSent) {
        return res.status(500).json({
          status: "error",
          code: 500,
          message: "Lỗi khi tải file",
        });
      }
    });
  } catch (error) {
    console.error("Download document error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: "Lỗi server khi tải tài liệu",
      });
    }
  }
};

/**
 * API: Track document action (view/download)
 * POST /api/documents/:id/track
 * Access: Authenticated users
 */
const trackDocument = async (req, res) => {
  try {
    const { id: docId } = req.params;
    const userId = req.user.id;
    const { type } = req.body;

    if (!type || !["view", "download"].includes(type)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [
          {
            field: "type",
            message: "Loại hành động phải là 'view' hoặc 'download'",
          },
        ],
      });
    }

    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    const result = await Statistic.trackAction(docId, userId, type);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: result.message,
      data: {
        isFirstTime: result.isFirstTime,
        type,
      },
    });
  } catch (error) {
    console.error("Track document error:", error);

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi ghi nhận thống kê",
    });
  }
};

/**
 * API: Dashboard Stats
 * GET /api/admin/stats
 * Access: Admin
 */
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalDocuments,
      pendingDocuments,
      activeUsers,
      totalViewsAgg,
      totalDownloadsAgg,
      categories,
    ] = await Promise.all([
      Document.countDocuments(),
      Document.countDocuments({ status: "pending" }),
      User.countDocuments({ status: "active" }),
      Document.aggregate([
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Document.aggregate([
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      Category.find({}).sort({ documentCount: -1 }),
    ]);

    const overview = {
      totalDocuments,
      pendingDocuments,
      activeUsers,
      totalViews: totalViewsAgg[0]?.total || 0,
      totalDownloads: totalDownloadsAgg[0]?.total || 0,
    };

    const topViewed = await Document.find({ status: "approved" })
      .sort({ views: -1 })
      .limit(10)
      .populate("categoryId", "name")
      .select("title categoryId views author");

    const topDownloaded = await Document.find({ status: "approved" })
      .sort({ downloads: -1 })
      .limit(10)
      .populate("categoryId", "name")
      .select("title categoryId downloads author");

    const totalDocsInCategory = categories.reduce(
      (sum, cat) => sum + cat.documentCount,
      0,
    );

    const categoryDistribution = categories.map((cat) => ({
      category: cat.name,
      documentCount: cat.documentCount,
      percentage:
        totalDocsInCategory > 0
          ? parseFloat(
              ((cat.documentCount / totalDocsInCategory) * 100).toFixed(2),
            )
          : 0,
    }));

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy thống kê thành công",
      data: {
        overview,
        topViewed: topViewed.map((doc) => ({
          id: doc._id,
          title: doc.title,
          category: doc.categoryId?.name || "N/A",
          views: doc.views,
          author: doc.author,
        })),
        topDownloaded: topDownloaded.map((doc) => ({
          id: doc._id,
          title: doc.title,
          category: doc.categoryId?.name || "N/A",
          downloads: doc.downloads,
          author: doc.author,
        })),
        categoryDistribution,
        period: "all",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy thống kê",
    });
  }
};

/**
 * API 2.15: Đọc trực tuyến (PDF & EPUB)
 * GET /api/documents/:id/read
 * Access: Authenticated users
 *
 * QUAN TRỌNG cho EPUB:
 * - Phải dùng stream với đúng Content-Type
 * - react-reader yêu cầu binary data hoàn chỉnh
 */
const readDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.id;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    const isAdminOrModerator = ["Admin", "Moderator"].includes(userRole);
    const isOwner = document.uploadedBy?.toString() === userId;
    const isApproved = document.status === "approved";

    if (!isAdminOrModerator && !isOwner && !isApproved) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền đọc tài liệu này",
      });
    }

    // Xây dựng đường dẫn file tuyệt đối
    const filePath = path.join(process.cwd(), document.fileUrl);

    console.log("[READ] Document ID:", id);
    console.log("[READ] File path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("[READ] File not found:", filePath);
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "File không tồn tại trên server",
      });
    }

    // Set Content-Type
    // Dù res.sendFile tự detect, nhưng ta set explicit để đảm bảo đúng logic business
    let contentType = "application/pdf";
    if (
      document.fileFormat === "epub" ||
      document.fileName.toLowerCase().endsWith(".epub")
    ) {
      contentType = "application/epub+zip";
    }

    // CORS headers - giữ nguyên để frontend đọc được thông tin
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Type, Content-Disposition",
    );

    // Sử dụng res.sendFile để gửi file
    // Express sẽ tự động xử lý:
    // 1. Content-Type (dựa trên extension file hoặc headers đã set)
    // 2. Content-Length
    // 3. Range requests (206 Partial Content) - rất quan trọng cho EPUB
    // 4. ETag & Caching
    res.sendFile(
      filePath,
      {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${encodeURIComponent(document.fileName)}"`,
        },
      },
      (err) => {
        if (err) {
          console.error("[READ] Send file error:", err);
          // Chỉ gửi lỗi JSON nếu header chưa được gửi
          if (!res.headersSent) {
            res.status(500).json({
              status: "error",
              code: 500,
              message: "Lỗi khi đọc file",
            });
          }
        } else {
          console.log("[READ] Sent file successfully");
        }
      },
    );
  } catch (error) {
    console.error("Read document error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: "Lỗi server khi đọc tài liệu",
      });
    }
  }
};

module.exports = {
  uploadDocument,
  reviewDocument,
  getDocuments,
  getMyDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  readDocument,
  downloadDocument,
  trackDocument,
  getDashboardStats,
};
