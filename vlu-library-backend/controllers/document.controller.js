const Document = require("../models/document.model");
const Category = require("../models/category.model");
const Statistic = require("../models/statistics.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const EditRequest = require("../models/editRequest.model");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const axios = require("axios");
// Import helper functions từ upload middleware
const {
  getFileUrl,
  deleteFile,
  isS3Url,
  STORAGE_MODE,
} = require("../middleware/upload.middleware");

/**
 * ========================================
 * HELPER FUNCTIONS CHO TÌM KIẾM THÔNG MINH
 * ========================================
 */
const QUOTA_EXEMPT_ROLES = ["Admin", "Moderator"];

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

const WIKIDATA_USER_AGENT = "VLU-Library-Bot/1.0 (contact@vlu.edu.vn)";

/**
 * API 2.5: Tải lên tài liệu (F6)
 * POST /api/documents/upload
 * Access: Author, Admin
 *
 * Hỗ trợ định dạng: PDF, EPUB
 */
const uploadDocument = async (req, res) => {
  try {
    const mainFile = req.files?.file?.[0];

    if (!mainFile) {
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

    const {
      title,
      description,
      category,
      author,
      isbn,
      publisher,
      englishTitle,
      publishYear,
      language,
      copyrightType,
      isTosAccepted,
      authorDeclaration,
    } = req.body;

    // ========== VALIDATIONS (giữ nguyên) ==========

    if (!title || !title.trim()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [{ field: "title", message: "Tiêu đề tài liệu là bắt buộc" }],
      });
    }

    if (!category) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [{ field: "category", message: "Danh mục là bắt buộc" }],
      });
    }

    const tosAccepted = isTosAccepted === "true" || isTosAccepted === true;
    if (!tosAccepted) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Bạn phải đồng ý với Điều khoản Dịch vụ để tải lên tài liệu",
        errors: [
          {
            field: "isTosAccepted",
            message: "Vui lòng đọc và đồng ý với Điều khoản Dịch vụ",
          },
        ],
      });
    }

    const validCopyrightTypes = [
      "OWN_CREATION",
      "PUBLIC_DOMAIN",
      "THIRD_PARTY_AUTHORIZED",
    ];
    const finalCopyrightType = copyrightType || "OWN_CREATION";
    if (!validCopyrightTypes.includes(finalCopyrightType)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Loại bản quyền không hợp lệ",
        errors: [
          {
            field: "copyrightType",
            message: "Vui lòng chọn loại bản quyền hợp lệ",
          },
        ],
      });
    }

    const authorizationFile = req.files?.authorizationFile?.[0];
    if (finalCopyrightType === "THIRD_PARTY_AUTHORIZED" && !authorizationFile) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Tài liệu bên thứ 3 bắt buộc phải có file giấy ủy quyền",
        errors: [
          {
            field: "authorizationFile",
            message:
              "Vui lòng tải lên Giấy ủy quyền / Minh chứng bản quyền (PDF hoặc ảnh)",
          },
        ],
      });
    }

    const isAuthorDeclaration =
      authorDeclaration === "true" || authorDeclaration === true;
    if (finalCopyrightType === "OWN_CREATION" && !isAuthorDeclaration) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Bạn phải xác nhận cam đoan là tác giả gốc",
        errors: [
          {
            field: "authorDeclaration",
            message: "Vui lòng xác nhận cam đoan tác giả",
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

    let fileFormat = "pdf";
    if (mainFile.mimetype === "application/epub+zip") {
      fileFormat = "epub";
    }

    let authorizationFileUrl = null;
    if (authorizationFile) {
      authorizationFileUrl = getFileUrl(authorizationFile);
    }

    const newDocument = new Document({
      title: title.trim(),
      description: description ? description.trim() : "",
      author: author ? author.trim() : null,
      isbn: isbn ? isbn.trim() : "",
      publisher: publisher ? publisher.trim() : null,
      englishTitle: englishTitle ? englishTitle.trim() : "",
      publishYear: publishYear ? parseInt(publishYear) : null,
      documentLanguage: language ? language.trim() : "Tiếng Việt",
      categoryId: category,
      uploadedBy: req.user.id,
      fileUrl: getFileUrl(mainFile),
      fileName: mainFile.originalname,
      fileSize: mainFile.size,
      fileFormat: fileFormat,
      status: "pending",
      copyrightType: finalCopyrightType,
      authorizationFileUrl: authorizationFileUrl,
      isTosAccepted: true,
      authorDeclaration:
        finalCopyrightType === "OWN_CREATION" ? isAuthorDeclaration : false,
    });

    const savedDocument = await newDocument.save();

    await Category.findByIdAndUpdate(category, {
      $inc: { documentCount: 1 },
    });

    // QUOTA LOGIC: Cập nhật vòng lặp upload của User
    // Chỉ áp dụng cho User/Author — Admin/Moderator không tính vòng lặp
    if (!QUOTA_EXEMPT_ROLES.includes(req.user.role)) {
      try {
        // Dùng findByIdAndUpdate với $inc để tránh race condition
        // nếu user upload nhiều file cùng lúc (atomic operation)
        const updatedUser = await User.findByIdAndUpdate(
          req.user.id,
          { $inc: { uploadCycleCount: 1 } },
          { new: true }, // Trả về document sau khi đã update
        );

        // Kiểm tra xem đã đủ 3 upload trong vòng lặp chưa
        if (updatedUser.uploadCycleCount >= 3) {
          // FIX: Dùng $max để floor downloadAllowance về 0 trước khi $inc.
          //
          // Vấn đề: Nếu downloadAllowance đang là số âm trong DB (do bug cũ),
          // $inc: 5 sẽ cộng từ giá trị âm → kết quả sai.
          // Ví dụ: allowance = -1 → $inc(5) → 4 (thiếu 1 lượt)
          //
          // Fix: $max đảm bảo allowance không nhỏ hơn 0 trước khi cộng.
          // MongoDB không hỗ trợ $max và $inc trên cùng field trong 1 operation
          // → 2 step liên tiếp, chấp nhận được vì uploadCycleCount không thay đổi.
          await User.findByIdAndUpdate(req.user.id, {
            $max: { downloadAllowance: 0 }, // Floor về 0 nếu đang âm
          });
          await User.findByIdAndUpdate(req.user.id, {
            $inc: { downloadAllowance: 5 },
            $set: { uploadCycleCount: 0 },
          });

          console.log(
            `[Quota] User ${req.user.id} completed upload cycle. +5 download allowance granted.`,
          );
        }
      } catch (quotaError) {
        // KHÔNG để lỗi quota làm fail request upload chính
        // Log lại để debug sau
        console.error("[Quota] Failed to update upload quota:", quotaError);
      }
    }
    // END QUOTA LOGIC

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
          englishTitle: populatedDoc.englishTitle,
          isbn: populatedDoc.isbn,
          publisher: populatedDoc.publisher,
          publishYear: populatedDoc.publishYear,
          language: populatedDoc.documentLanguage,
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
          copyrightType: populatedDoc.copyrightType,
          authorizationFileUrl: populatedDoc.authorizationFileUrl,
          isTosAccepted: populatedDoc.isTosAccepted,
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

    // ====== TRIGGER NOTIFICATION ======
    try {
      const notificationData = {
        recipient: document.uploadedBy,
        type: "DOCUMENT_MODERATION",
        relatedDocument: document._id,
        actionBy: reviewerId,
      };

      if (status === "approved") {
        notificationData.title = "Tài liệu đã được duyệt ✅";
        notificationData.message = `Tài liệu "${document.title}" của bạn đã được kiểm duyệt và xuất bản thành công.`;
      } else {
        notificationData.title = "Tài liệu bị từ chối ❌";
        notificationData.message = `Tài liệu "${document.title}" của bạn đã bị từ chối. Lý do: ${reason.trim()}`;
      }

      await Notification.create(notificationData);
    } catch (notifError) {
      // Không để lỗi notification làm fail request chính
      console.error(
        "[Notification] Failed to create notification:",
        notifError,
      );
    }
    // ====== END TRIGGER ======

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
          englishTitle: document.englishTitle,
          isbn: document.isbn,
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
          englishTitle: doc.englishTitle,
          publisher: doc.publisher,
          publishYear: doc.publishYear,
          documentLanguage: doc.documentLanguage,
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
          englishTitle: doc.englishTitle,
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
          englishTitle: document.englishTitle,
          isbn: document.isbn,
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
  API: Update document (API 2.10)
  PUT /api/documents/:id
  Access: Owner (pending/rejected only), Admin (all)
  Business Rules:
  Owner chỉ có thể sửa tài liệu 'pending' hoặc 'rejected'
  Admin có thể sửa tất cả
  Nếu tài liệu đang 'rejected', sau khi sửa sẽ tự động chuyển về 'pending'
  Hỗ trợ thay đổi file (optional)
*/
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const {
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
    const uploadedById = document.uploadedBy?._id
      ? document.uploadedBy._id.toString()
      : document.uploadedBy?.toString();
    const currentUserId = userId?.toString();

    const isOwner = uploadedById === currentUserId;
    const isAdmin = userRole === "Admin";
    console.log("[UpdateDocument] Permission check:", {
      documentId: id,
      uploadedById,
      currentUserId,
      isOwner,
      isAdmin,
    });
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền chỉnh sửa tài liệu này",
      });
    }
    // Owner can only edit pending or rejected documents
    // Admin can edit all documents
    if (isOwner && !isAdmin) {
      if (document.status === "approved") {
        return res.status(400).json({
          status: "error",
          code: 400,
          message:
            "Không thể chỉnh sửa tài liệu đã được duyệt. Vui lòng liên hệ Admin.",
        });
      }
    }
    // Store old status for comparison
    const oldStatus = document.status;
    const oldCategoryId = document.categoryId?.toString();
    // Update fields
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
    // Handle category change
    if (category && category !== oldCategoryId) {
      // Decrease count on old category
      if (oldCategoryId) {
        await Category.findByIdAndUpdate(oldCategoryId, {
          $inc: { documentCount: -1 },
        });
      }
      // Increase count on new category
      await Category.findByIdAndUpdate(category, {
        $inc: { documentCount: 1 },
      });
      document.categoryId = category;
    }
    // Handle file update if provided (via multer)
    if (req.file) {
      // Delete old file from storage
      if (document.fileUrl) {
        await deleteFile(document.fileUrl);
      }
      // Determine file format
      let fileFormat = "pdf";
      if (req.file.mimetype === "application/epub+zip") {
        fileFormat = "epub";
      }
      // Update file info
      document.fileUrl = getFileUrl(req.file);
      document.fileName = req.file.originalname;
      document.fileSize = req.file.size;
      document.fileFormat = fileFormat;
    }
    // If document was rejected, reset to pending for re-review
    if (oldStatus === "rejected") {
      document.status = "pending";
      document.rejectionReason = null;
      document.reviewedBy = null;
      document.reviewedAt = null;
    }
    // Save changes
    await document.save();
    // Populate for response
    await document.populate("categoryId", "name slug");
    await document.populate("uploadedBy", "name email role");
    return res.status(200).json({
      status: "success",
      code: 200,
      message:
        oldStatus === "rejected"
          ? "Cập nhật tài liệu thành công. Tài liệu đã được gửi lại để kiểm duyệt."
          : "Cập nhật tài liệu thành công",
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
          language: document.language,
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
          statusChanged: oldStatus !== document.status,
          previousStatus: oldStatus !== document.status ? oldStatus : undefined,
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

const getLinkedData = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);

    console.log("FOUND DOCUMENT:", document?._id);
    console.log("CURRENT lodMetadata:", document?.lodMetadata);

    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    if (document.lodMetadata) {
      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Lấy dữ liệu liên kết thành công (cache)",
        data: {
          source: "cache",
          lod: document.lodMetadata,
        },
      });
    }

    const searchKey = document.englishTitle || document.title;

    const searchResponse = await axios.get(
      "https://www.wikidata.org/w/api.php",
      {
        params: {
          action: "wbsearchentities",
          search: searchKey,
          language: "en",
          format: "json",
        },
        headers: {
          "User-Agent": WIKIDATA_USER_AGENT,
        },
      },
    );

    console.log("WIKIDATA SEARCH RAW:", searchResponse.data);
    console.log("SEARCH RESULTS COUNT:", searchResponse.data?.search?.length);
    console.log("FIRST RESULT:", searchResponse.data?.search?.[0]);

    const qid = searchResponse.data?.search?.[0]?.id;

    console.log("SELECTED QID:", qid);

    if (!qid) {
      return res.status(200).json({
        status: "success",
        code: 200,
        message: "Không tìm thấy trên Wikidata",
        data: {
          source: "wikidata",
          lod: null,
        },
      });
    }

    const sparqlQuery = `
      SELECT ?description ?publisherLabel ?date ?genreLabel ?pages WHERE {
        wd:${qid} wdt:P31 ?instance.
        OPTIONAL { wd:${qid} schema:description ?description . FILTER(LANG(?description) = "vi" || LANG(?description) = "en") }
        OPTIONAL { wd:${qid} wdt:P123 ?publisher . }
        OPTIONAL { wd:${qid} wdt:P577 ?date . }
        OPTIONAL { wd:${qid} wdt:P136 ?genre . }
        OPTIONAL { wd:${qid} wdt:P1104 ?pages . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "vi,en". }
      } LIMIT 1
    `;

    const sparqlResponse = await axios.get(
      "https://query.wikidata.org/sparql",
      {
        params: {
          query: sparqlQuery,
          format: "json",
        },
        headers: {
          "User-Agent": WIKIDATA_USER_AGENT,
        },
      },
    );

    console.log("SPARQL RAW:", sparqlResponse.data);
    console.log("SPARQL BINDINGS:", sparqlResponse.data?.results?.bindings);

    const firstBinding = sparqlResponse.data?.results?.bindings?.[0] || null;

    const parsedLod = {
      qid,
      wikidataUrl: `https://www.wikidata.org/wiki/${qid}`,
      description: firstBinding?.description?.value || "",
      publisher: firstBinding?.publisherLabel?.value || "",
      publicationDate: firstBinding?.date?.value || "",
      genre: firstBinding?.genreLabel?.value || "",
      pages: firstBinding?.pages?.value || "",
      searchKey,
    };

    console.log("PARSED LOD:", parsedLod);

    document.lodMetadata = parsedLod;
    await document.save();
    console.log("SAVED lodMetadata:", document.lodMetadata);

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy dữ liệu liên kết thành công",
      data: {
        source: "wikidata",
        lod: parsedLod,
      },
    });
  } catch (error) {
    console.error("Get linked data error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy dữ liệu liên kết",
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

    // Delete file from storage (S3 hoặc Local)
    await deleteFile(document.fileUrl);

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

    // ========== Check access permission ==========
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

    // Kiểm tra lượt tải trước khi stream file
    // Admin/Moderator: bypass hoàn toàn
    // User/Author: Kiểm tra downloadAllowance
    if (!QUOTA_EXEMPT_ROLES.includes(userRole)) {
      // FIX: Atomic check-and-decrement bằng findOneAndUpdate với condition.
      //
      // TRƯỚC (bug): 2 operation riêng biệt — không atomic:
      //   1. findById → đọc allowance
      //   2. findByIdAndUpdate $inc: -1 → trừ
      //   → Race condition: 2 tab cùng lúc đều pass check rồi đều trừ
      //   → allowance xuống âm (-1, -2, ...)
      //
      // SAU (fix): 1 atomic operation với điều kiện { downloadAllowance: { $gt: 0 } }:
      //   - Nếu allowance > 0 → update thành công, trả về doc mới
      //   - Nếu allowance = 0 → condition không match → trả về null → block
      //   - Không bao giờ xuống âm vì check và decrement xảy ra cùng lúc
      const deductedUser = await User.findOneAndUpdate(
        {
          _id: userId,
          downloadAllowance: { $gt: 0 }, // Chỉ trừ khi còn lượt
        },
        {
          $inc: { downloadAllowance: -1 },
        },
        { new: true, select: "downloadAllowance uploadCycleCount" },
      );

      if (!deductedUser) {
        // Không update được → allowance đã = 0 → block
        // Lấy thêm uploadCycleCount để trả về tiến độ cho frontend
        const freshUser = await User.findById(userId).select(
          "uploadCycleCount downloadAllowance",
        );
        return res.status(403).json({
          status: "error",
          code: 403,
          message: "QUOTA_EXCEEDED",
          detail:
            "Bạn đã hết lượt tải. Vui lòng đóng góp thêm tài liệu để nhận lượt tải mới.",
          currentCycle: freshUser?.uploadCycleCount ?? 0,
          needed: 3 - (freshUser?.uploadCycleCount ?? 0),
        });
      }

      console.log(
        `[Quota] User ${userId} downloaded. Allowance: ${deductedUser.downloadAllowance + 1} → ${deductedUser.downloadAllowance}`,
      );
    }
    // END QUOTA CHECK

    // ========== stream file ==========
    let contentType = "application/pdf";
    if (
      document.fileFormat === "epub" ||
      document.fileName.toLowerCase().endsWith(".epub")
    ) {
      contentType = "application/epub+zip";
    }

    console.log("[DOWNLOAD] Document ID:", id);
    console.log("[DOWNLOAD] Storage Mode:", STORAGE_MODE);
    console.log("[DOWNLOAD] File URL:", document.fileUrl);
    console.log("[DOWNLOAD] Content-Type:", contentType);

    if (document.fileUrl.includes(".amazonaws.com/")) {
      console.log("[DOWNLOAD] Proxying from S3...");

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${encodeURIComponent(document.fileName)}"`,
      );

      const httpModule = document.fileUrl.startsWith("https") ? https : http;

      httpModule
        .get(document.fileUrl, (s3Response) => {
          if (s3Response.headers["content-length"]) {
            res.setHeader(
              "Content-Length",
              s3Response.headers["content-length"],
            );
          }

          if (s3Response.statusCode !== 200) {
            if (!res.headersSent) {
              return res.status(404).json({
                status: "error",
                message: "File không tồn tại trên storage",
              });
            }
            return;
          }

          s3Response.pipe(res);
        })
        .on("error", (err) => {
          console.error("[DOWNLOAD] S3 error:", err);
          if (!res.headersSent) {
            res.status(500).json({
              status: "error",
              message: "Không thể kết nối đến storage",
            });
          }
        });

      return;
    }

    const filePath = path.join(process.cwd(), document.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "File không tồn tại trên server",
      });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(document.fileName)}"`,
    );

    res.setHeader("Content-Type", contentType);

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

    // ĐỊNH NGHĨA contentType TRƯỚC KHI SỬ DỤNG
    let contentType = "application/pdf";
    if (
      document.fileFormat === "epub" ||
      document.fileName.toLowerCase().endsWith(".epub")
    ) {
      contentType = "application/epub+zip";
    }

    console.log("[READ] Document ID:", id);
    console.log("[READ] Storage Mode:", STORAGE_MODE);
    console.log("[READ] File URL:", document.fileUrl);
    console.log("[READ] Content-Type:", contentType);

    // ========== S3 MODE: Proxy stream từ S3 ==========
    if (document.fileUrl.includes(".amazonaws.com/")) {
      console.log("[READ] Proxying from S3...");

      res.setHeader("Content-Type", contentType); // ✅ Giờ contentType đã có giá trị
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(document.fileName)}"`,
      );
      res.setHeader(
        "Access-Control-Expose-Headers",
        "Content-Length, Content-Type, Content-Disposition",
      );

      const httpModule = document.fileUrl.startsWith("https") ? https : http;

      httpModule
        .get(document.fileUrl, (s3Response) => {
          if (s3Response.headers["content-length"]) {
            res.setHeader(
              "Content-Length",
              s3Response.headers["content-length"],
            );
          }

          if (s3Response.statusCode !== 200) {
            console.error("[READ] S3 returned status:", s3Response.statusCode);
            if (!res.headersSent) {
              return res.status(404).json({
                status: "error",
                code: 404,
                message: "File không tồn tại trên storage",
              });
            }
            return;
          }

          s3Response.pipe(res);

          s3Response.on("error", (err) => {
            console.error("[READ] S3 stream error:", err);
            if (!res.headersSent) {
              res.status(500).json({
                status: "error",
                message: "Lỗi khi đọc file từ storage",
              });
            }
          });
        })
        .on("error", (err) => {
          console.error("[READ] Request to S3 error:", err);
          if (!res.headersSent) {
            res.status(500).json({
              status: "error",
              message: "Lỗi kết nối storage",
            });
          }
        });

      return;
    }

    // ========== LOCAL MODE: Stream file từ local ==========
    const filePath = path.join(process.cwd(), document.fileUrl);

    if (!fs.existsSync(filePath)) {
      console.error("[READ] File not found:", filePath);
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "File không tồn tại trên server",
      });
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

/**
 * API: Lấy tài liệu nổi bật cho Landing Page
 * GET /api/documents/featured
 * Access: Public (không cần đăng nhập)
 *
 * @query {string} type - Loại featured: 'newest' | 'popular' | 'most-downloaded'
 * @query {number} limit - Số lượng tài liệu (default: 8, max: 12)
 */
const getFeaturedDocuments = async (req, res) => {
  try {
    const { type = "newest", limit = 8 } = req.query;

    // Validate limit
    const limitNum = Math.min(Math.max(parseInt(limit) || 8, 1), 12);

    // Build sort options based on type
    let sortOption = { createdAt: -1 }; // Default: newest

    switch (type) {
      case "popular":
        sortOption = { views: -1, createdAt: -1 };
        break;
      case "most-downloaded":
        sortOption = { downloads: -1, createdAt: -1 };
        break;
      case "top-rated":
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case "newest":
      default:
        sortOption = { createdAt: -1 };
    }

    // Query only approved documents
    const documents = await Document.find({ status: "approved" })
      .sort(sortOption)
      .limit(limitNum)
      .populate("uploadedBy", "name email")
      .populate("categoryId", "name slug")
      .select(
        "title description author publisher publishYear fileFormat fileName fileSize coverImage views downloads rating commentCount createdAt",
      )
      .lean();

    // Transform response
    const transformedDocs = documents.map((doc) => ({
      id: doc._id,
      title: doc.title,
      description: doc.description,
      author: doc.author,
      englishTitle: doc.englishTitle,
      publisher: doc.publisher,
      publishYear: doc.publishYear,
      fileFormat: doc.fileFormat,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      coverImage: doc.coverImage,
      views: doc.views || 0,
      downloads: doc.downloads || 0,
      rating: doc.rating || 0,
      commentCount: doc.commentCount || 0,
      createdAt: doc.createdAt,
      uploadedBy: doc.uploadedBy
        ? {
            id: doc.uploadedBy._id,
            name: doc.uploadedBy.name,
          }
        : null,
      category: doc.categoryId
        ? {
            id: doc.categoryId._id,
            name: doc.categoryId.name,
            slug: doc.categoryId.slug,
          }
        : null,
    }));

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách tài liệu nổi bật thành công",
      data: {
        documents: transformedDocs,
        type,
        count: transformedDocs.length,
      },
    });
  } catch (error) {
    console.error("Get featured documents error:", error);

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy tài liệu nổi bật",
    });
  }
};

/**
 * API: Lấy thống kê công khai cho Landing Page
 * GET /api/documents/public-stats
 * Access: Public (không cần đăng nhập)
 */
const getPublicStats = async (req, res) => {
  try {
    // Parallel queries for better performance
    const [totalDocuments, totalUsers, totalViewsResult, totalDownloadsResult] =
      await Promise.all([
        // Đếm tài liệu đã duyệt
        Document.countDocuments({ status: "approved" }),
        // Đếm users active
        User.countDocuments({ status: "active" }),
        // Tổng lượt xem
        Document.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: null, total: { $sum: "$views" } } },
        ]),
        // Tổng lượt tải
        Document.aggregate([
          { $match: { status: "approved" } },
          { $group: { _id: null, total: { $sum: "$downloads" } } },
        ]),
      ]);

    const totalViews = totalViewsResult[0]?.total || 0;
    const totalDownloads = totalDownloadsResult[0]?.total || 0;

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy thống kê thành công",
      data: {
        stats: {
          documents: totalDocuments,
          users: totalUsers,
          views: totalViews,
          downloads: totalDownloads,
        },
      },
    });
  } catch (error) {
    console.error("Get public stats error:", error);

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy thống kê",
    });
  }
};

/**
 * API: Thống kê tài liệu của Author
 * GET /api/documents/stats/author
 * Access: Author, Admin (phải đăng nhập)
 *
 * @query {string} period - 'day' | 'month' | 'year' (default: 'month')
 * @query {string} date - ISO date string (default: current date)
 *
 * Response:
 * - period = 'day': Thống kê theo giờ (0-23) trong ngày được chọn
 * - period = 'month': Thống kê theo ngày (1-31) trong tháng được chọn
 * - period = 'year': Thống kê theo tháng (1-12) trong năm được chọn
 */
const getAuthorStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "month", date } = req.query;

    // Parse date hoặc dùng ngày hiện tại
    const selectedDate = date ? new Date(date) : new Date();

    // Validate period
    if (!["day", "month", "year"].includes(period)) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Period phải là 'day', 'month' hoặc 'year'",
      });
    }

    // Xác định khoảng thời gian và format group
    let startDate, endDate, groupFormat, totalSlots, labelFormat;

    if (period === "day") {
      // Thống kê theo giờ trong ngày
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      groupFormat = { $hour: "$createdAt" };
      totalSlots = 24;
      labelFormat = (i) => `${i}h`;
    } else if (period === "month") {
      // Thống kê theo ngày trong tháng
      startDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1,
      );

      endDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      groupFormat = { $dayOfMonth: "$createdAt" };
      totalSlots = endDate.getDate(); // Số ngày trong tháng
      labelFormat = (i) => `${i}`;
    } else {
      // period === 'year' - Thống kê theo tháng trong năm
      startDate = new Date(selectedDate.getFullYear(), 0, 1);

      endDate = new Date(selectedDate.getFullYear(), 11, 31, 23, 59, 59, 999);

      groupFormat = { $month: "$createdAt" };
      totalSlots = 12;
      labelFormat = (i) => `T${i}`;
    }

    // Aggregation query
    const stats = await Document.aggregate([
      {
        $match: {
          uploadedBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Tạo map từ kết quả aggregation
    const statsMap = {};
    stats.forEach((item) => {
      statsMap[item._id] = item.count;
    });

    // Fill data với các khoảng thời gian trống = 0
    const chartData = [];
    const startIndex = period === "day" ? 0 : 1;
    const endIndex = period === "day" ? totalSlots - 1 : totalSlots;

    for (let i = startIndex; i <= endIndex; i++) {
      chartData.push({
        name: labelFormat(i),
        value: statsMap[i] || 0,
      });
    }

    // Tính tổng số tài liệu trong khoảng thời gian
    const totalDocuments = chartData.reduce((sum, item) => sum + item.value, 0);

    // Thống kê theo status
    const statusStats = await Document.aggregate([
      {
        $match: {
          uploadedBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statusMap = { pending: 0, approved: 0, rejected: 0 };
    statusStats.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    // Thống kê views và downloads
    const engagementStats = await Document.aggregate([
      {
        $match: {
          uploadedBy: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalDownloads: { $sum: "$downloads" },
        },
      },
    ]);

    const engagement = engagementStats[0] || {
      totalViews: 0,
      totalDownloads: 0,
    };

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy thống kê thành công",
      data: {
        period,
        selectedDate: selectedDate.toISOString(),
        range: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        chartData,
        summary: {
          totalDocuments,
          pending: statusMap.pending,
          approved: statusMap.approved,
          rejected: statusMap.rejected,
          totalViews: engagement.totalViews,
          totalDownloads: engagement.totalDownloads,
        },
      },
    });
  } catch (error) {
    console.error("Get author stats error:", error);

    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy thống kê",
    });
  }
};

/**
 * API: Tạo yêu cầu chỉnh sửa tài liệu đã duyệt
 * POST /api/documents/:id/edit-requests
 * Access: Author (chủ sở hữu tài liệu)
 *
 * Business Rules:
 * - Tài liệu phải có status = 'approved'
 * - Người gửi phải là chủ sở hữu tài liệu
 * - Không được gửi trùng yêu cầu (kiểm tra pending request)
 */
const createEditRequest = async (req, res) => {
  try {
    const { id: documentId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    // Validate reason
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Lý do xin chỉnh sửa là bắt buộc",
        errors: [{ field: "reason", message: "Vui lòng nhập lý do xin sửa" }],
      });
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Lý do quá ngắn",
        errors: [
          {
            field: "reason",
            message: "Lý do phải có ít nhất 10 ký tự",
          },
        ],
      });
    }

    // Lấy document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    // Kiểm tra quyền sở hữu
    const uploadedById = document.uploadedBy?.toString();
    if (uploadedById !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền gửi yêu cầu cho tài liệu này",
      });
    }

    // Tài liệu phải đang approved
    if (document.status !== "approved") {
      return res.status(400).json({
        status: "error",
        code: 400,
        message:
          document.status === "pending"
            ? "Tài liệu đang chờ duyệt. Bạn có thể chỉnh sửa trực tiếp."
            : "Chỉ có thể yêu cầu chỉnh sửa tài liệu đã được duyệt",
      });
    }

    // Kiểm tra yêu cầu pending đã tồn tại chưa
    const existingRequest = await EditRequest.findOne({
      document: documentId,
      author: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message:
          "Bạn đã gửi yêu cầu chỉnh sửa cho tài liệu này và đang chờ Admin xét duyệt",
      });
    }

    // Tạo edit request
    const editRequest = await EditRequest.create({
      document: documentId,
      author: userId,
      reason: reason.trim(),
      status: "pending",
    });

    await editRequest.populate("document", "title");
    await editRequest.populate("author", "name email");

    return res.status(201).json({
      status: "success",
      code: 201,
      message:
        "Gửi yêu cầu chỉnh sửa thành công. Vui lòng chờ Admin xét duyệt.",
      data: {
        editRequest: {
          id: editRequest._id,
          document: {
            id: editRequest.document._id,
            title: editRequest.document.title,
          },
          author: {
            id: editRequest.author._id,
            name: editRequest.author.name,
          },
          reason: editRequest.reason,
          status: editRequest.status,
          createdAt: editRequest.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create edit request error:", error);
    return res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi gửi yêu cầu chỉnh sửa",
    });
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
  getFeaturedDocuments,
  getPublicStats,
  getAuthorStats,
  getLinkedData,
  createEditRequest,
};
