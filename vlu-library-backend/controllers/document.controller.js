const Document = require("../models/document.model");
const Category = require("../models/category.model");
const Statistic = require("../models/statistics.model");
const User = require("../models/user.model");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

/**
 * ========================================
 * HELPER FUNCTIONS CHO TÌM KIẾM THÔNG MINH
 * ========================================
 */

/**
 * Escape các ký tự đặc biệt trong regex
 * Ví dụ: "Node.js" → "Node\\.js"
 */
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Tạo pattern tìm kiếm linh hoạt
 * - Cho phép dấu chấm, gạch ngang optional giữa các ký tự
 * - Ví dụ: "Nodejs" → "N[._-]?o[._-]?d[._-]?e[._-]?j[._-]?s"
 * - Match được: Node.js, NodeJS, Node-js, Nodejs, node.js
 */
const createFlexiblePattern = (word) => {
  // Escape ký tự đặc biệt trước
  const escaped = escapeRegex(word);
  // Cho phép dấu chấm/gạch ngang optional giữa các ký tự
  return escaped.split("").join("[._-]?");
};

/**
 * Loại bỏ dấu tiếng Việt
 * Ví dụ: "Giáo trình" → "Giao trinh"
 */
const removeVietnameseTones = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

/**
 * Tạo search query thông minh
 * @param {string} searchKeyword - Từ khóa tìm kiếm từ user
 * @returns {Object} MongoDB query object
 */
const buildSmartSearchQuery = (searchKeyword) => {
  if (!searchKeyword || !searchKeyword.trim()) {
    return null;
  }

  const trimmed = searchKeyword.trim();

  // Tách thành các từ (split by space)
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);

  if (words.length === 0) {
    return null;
  }

  // Nếu chỉ có 1 từ
  if (words.length === 1) {
    const word = words[0];
    const flexPattern = createFlexiblePattern(word);
    const noTonesPattern = removeVietnameseTones(word);

    return {
      $or: [
        // Tìm chính xác (có thể có dấu chấm/gạch ngang)
        { title: { $regex: flexPattern, $options: "i" } },
        { author: { $regex: flexPattern, $options: "i" } },
        { description: { $regex: flexPattern, $options: "i" } },
        { fileName: { $regex: flexPattern, $options: "i" } },
        // Tìm không dấu (cho tiếng Việt)
        { title: { $regex: noTonesPattern, $options: "i" } },
      ],
    };
  }

  // Nếu có nhiều từ: TẤT CẢ các từ phải xuất hiện (AND logic)
  const andConditions = words.map((word) => {
    const flexPattern = createFlexiblePattern(word);
    return {
      $or: [
        { title: { $regex: flexPattern, $options: "i" } },
        { author: { $regex: flexPattern, $options: "i" } },
        { description: { $regex: flexPattern, $options: "i" } },
        { fileName: { $regex: flexPattern, $options: "i" } },
      ],
    };
  });

  return { $and: andConditions };
};

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
 * GET /api/documents (Public - chỉ approved)
 * GET /api/admin/documents (Admin - tất cả status)
 * Access: Public / Admin, Moderator
 *
 * ĐÃ SỬA: Hỗ trợ đầy đủ các filter từ frontend mới
 * - q: search keyword (thay vì search)
 * - category: hỗ trợ cả string và array
 * - yearFrom, yearTo: filter theo năm xuất bản
 * - type: filter theo loại file (pdf, epub)
 * - sort: newest, oldest, mostViewed, mostDownloaded, highestRated
 */
const getDocuments = async (req, res) => {
  try {
    // Lấy tất cả query params - HỖ TRỢ CẢ 'q' và 'search'
    const {
      q,
      search,
      category,
      page = 1,
      limit = 10,
      sort = "newest",
      yearFrom,
      yearTo,
      type,
      status,
    } = req.query;

    // Xác định đây là API public hay admin dựa trên URL
    const isAdminRoute = req.originalUrl.includes("/admin/");

    // Build query
    const query = {};

    // Status filter
    if (isAdminRoute) {
      if (status && status !== "all") {
        query.status = status;
      }
    } else {
      query.status = "approved";
    }

    // Search by keyword - SỬ DỤNG TÌM KIẾM THÔNG MINH
    const searchKeyword = q || search;
    if (searchKeyword) {
      const smartQuery = buildSmartSearchQuery(searchKeyword);
      if (smartQuery) {
        // Merge smart search query vào main query
        if (smartQuery.$or) {
          query.$or = smartQuery.$or;
        } else if (smartQuery.$and) {
          query.$and = smartQuery.$and;
        }
      }
    }

    // Filter by category - HỖ TRỢ ARRAY
    let categoryIds = req.query.category || req.query["category[]"];
    if (categoryIds) {
      if (!Array.isArray(categoryIds)) {
        categoryIds = [categoryIds];
      }
      categoryIds = categoryIds.filter((id) => id && id !== "all");
      if (categoryIds.length > 0) {
        if (categoryIds.length === 1) {
          query.categoryId = categoryIds[0];
        } else {
          query.categoryId = { $in: categoryIds };
        }
      }
    }

    // Filter by year range - ĐÃ THÊM
    if (yearFrom) {
      query.publishYear = { ...query.publishYear, $gte: parseInt(yearFrom) };
    }
    if (yearTo) {
      query.publishYear = { ...query.publishYear, $lte: parseInt(yearTo) };
    }

    // Filter by file type - ĐÃ THÊM
    if (type && type !== "all") {
      query.fileFormat = type;
    }

    // Sort options - ĐÃ SỬA để map các giá trị từ frontend
    let sortOption = {};
    switch (sort) {
      case "newest":
      case "-createdAt":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
      case "createdAt":
        sortOption = { createdAt: 1 };
        break;
      case "mostViewed":
      case "-views":
        sortOption = { views: -1 };
        break;
      case "mostDownloaded":
      case "-downloads":
        sortOption = { downloads: -1 };
        break;
      case "highestRated":
      case "-rating":
        sortOption = { rating: -1 };
        break;
      case "title":
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [documents, totalDocs] = await Promise.all([
      Document.find(query)
        .populate("categoryId", "name slug")
        .populate("uploadedBy", "name email")
        .populate("reviewedBy", "name email")
        .sort(sortOption)
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
          reviewedBy: doc.reviewedBy
            ? {
                id: doc.reviewedBy._id,
                name: doc.reviewedBy.name,
                email: doc.reviewedBy.email,
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
          totalDocuments: totalDocs, // Thêm để frontend có thể đọc
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
 * API: Get my documents (Author Dashboard)
 * GET /api/documents/my-documents
 * Access: Author, Admin
 */
const getMyDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q, status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    // Build query
    const query = { uploadedBy: userId };

    // Search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { author: { $regex: q, $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Sort
    let sortOption = {};
    if (sort === "-createdAt" || sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "createdAt" || sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get documents
    const [documents, totalDocuments] = await Promise.all([
      Document.find(query)
        .populate("categoryId", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Document.countDocuments(query),
    ]);

    // Get stats
    const [totalCount, approvedCount, pendingCount, rejectedCount] =
      await Promise.all([
        Document.countDocuments({ uploadedBy: userId }),
        Document.countDocuments({ uploadedBy: userId, status: "approved" }),
        Document.countDocuments({ uploadedBy: userId, status: "pending" }),
        Document.countDocuments({ uploadedBy: userId, status: "rejected" }),
      ]);

    const totalPages = Math.ceil(totalDocuments / limitNum);

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
          totalDocuments,
          limit: limitNum,
        },
        stats: {
          total: totalCount,
          approved: approvedCount,
          pending: pendingCount,
          rejected: rejectedCount,
        },
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
 * API: Get document by ID
 * GET /api/documents/:id
 * Access: Public (approved) / Admin (all)
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

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

    // Check access permission
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const isAdminOrModerator = ["Admin", "Moderator"].includes(userRole);
    const isOwner = document.uploadedBy?._id?.toString() === userId;

    if (document.status !== "approved" && !isAdminOrModerator && !isOwner) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền xem tài liệu này",
      });
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy thông tin tài liệu thành công",
      data: {
        document: {
          id: document._id,
          title: document.title,
          description: document.description,
          author: document.author,
          publisher: document.publisher,
          publishYear: document.publishYear,
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
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Get document by ID error:", error);

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy thông tin tài liệu",
    });
  }
};

/**
 * API: Update document
 * PUT /api/documents/:id
 * Access: Owner (pending only), Admin
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, author, publisher, publishYear, category } =
      req.body;
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

    // Check permission
    const isOwner = document.uploadedBy.toString() === userId;
    const isAdmin = userRole === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền chỉnh sửa tài liệu này",
      });
    }

    // Owner can only edit pending documents
    if (isOwner && !isAdmin && document.status !== "pending") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Chỉ có thể chỉnh sửa tài liệu đang chờ duyệt",
      });
    }

    // Update fields
    if (title) document.title = title.trim();
    if (description !== undefined) document.description = description.trim();
    if (author !== undefined) document.author = author ? author.trim() : null;
    if (publisher !== undefined)
      document.publisher = publisher ? publisher.trim() : null;
    if (publishYear !== undefined)
      document.publishYear = publishYear ? parseInt(publishYear) : null;
    if (category) document.categoryId = category;

    await document.save();

    await document.populate("categoryId", "name slug");
    await document.populate("uploadedBy", "name email role");

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Cập nhật tài liệu thành công",
      data: {
        document: {
          id: document._id,
          title: document.title,
          description: document.description,
          author: document.author,
          publisher: document.publisher,
          publishYear: document.publishYear,
          category: document.categoryId
            ? {
                id: document.categoryId._id,
                name: document.categoryId.name,
              }
            : null,
          status: document.status,
          updatedAt: document.updatedAt,
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
 * API: Delete document
 * DELETE /api/documents/:id
 * Access: Owner, Admin
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

    // Check permission
    const isOwner = document.uploadedBy.toString() === userId;
    const isAdmin = userRole === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền xóa tài liệu này",
      });
    }

    // Delete file from storage
    const filePath = path.join(process.cwd(), document.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update category document count
    await Category.findByIdAndUpdate(document.categoryId, {
      $inc: { documentCount: -1 },
    });

    // Delete document
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
 * API: Download document
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

    // Check access permission
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

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    );

    let contentType = "application/pdf";
    if (
      document.fileFormat === "epub" ||
      document.fileName.toLowerCase().endsWith(".epub")
    ) {
      contentType = "application/epub+zip";
    }
    res.setHeader("Content-Type", contentType);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on("error", (err) => {
      console.error("File stream error:", err);
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
 * GET /api/admin/documents/stats
 * Access: Admin
 *
 * Trả về đầy đủ thông tin cho StatCards:
 * - totalDocuments
 * - approvedDocuments
 * - pendingDocuments
 * - rejectedDocuments
 * - activeUsers
 * - totalViews
 * - totalDownloads
 */
const getDashboardStats = async (req, res) => {
  try {
    // Đếm tất cả các loại documents trong 1 lần query
    const [
      totalDocuments,
      approvedDocuments,
      pendingDocuments,
      rejectedDocuments,
      activeUsers,
      totalViewsAgg,
      totalDownloadsAgg,
      categories,
    ] = await Promise.all([
      Document.countDocuments(),
      Document.countDocuments({ status: "approved" }),
      Document.countDocuments({ status: "pending" }),
      Document.countDocuments({ status: "rejected" }),
      User.countDocuments({ status: "active" }),
      Document.aggregate([
        { $group: { _id: null, total: { $sum: "$views" } } },
      ]),
      Document.aggregate([
        { $group: { _id: null, total: { $sum: "$downloads" } } },
      ]),
      Category.find({}).sort({ documentCount: -1 }),
    ]);

    // Build overview object với đầy đủ thông tin
    const overview = {
      totalDocuments,
      approvedDocuments,
      pendingDocuments,
      rejectedDocuments,
      activeUsers,
      totalViews: totalViewsAgg[0]?.total || 0,
      totalDownloads: totalDownloadsAgg[0]?.total || 0,
    };

    // Top viewed documents
    const topViewed = await Document.find({ status: "approved" })
      .sort({ views: -1 })
      .limit(10)
      .populate("categoryId", "name")
      .select("title categoryId views author");

    // Top downloaded documents
    const topDownloaded = await Document.find({ status: "approved" })
      .sort({ downloads: -1 })
      .limit(10)
      .populate("categoryId", "name")
      .select("title categoryId downloads author");

    // Category distribution
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

    let contentType = "application/pdf";
    if (
      document.fileFormat === "epub" ||
      document.fileName.toLowerCase().endsWith(".epub")
    ) {
      contentType = "application/epub+zip";
    }

    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Type, Content-Disposition",
    );

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
