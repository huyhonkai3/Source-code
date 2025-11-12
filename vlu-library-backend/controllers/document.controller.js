const Document = require("../models/document.model");
const Category = require("../models/category.model");
const Statistic = require("../models/statistics.model");
const path = require("path");
const fs = require("fs");

/**
 * API 2.5: Tải lên tài liệu (F6)
 * POST /api/documents/upload
 * Access: Author, Admin
 *
 * Flow (theo Sequence_Diagram_Text.docx - Kịch bản 3):
 * 1. User (role: Author/Admin) upload file PDF + metadata
 * 2. Multer middleware xử lý file, lưu vào /uploads/
 * 3. Controller validate metadata và category
 * 4. Tạo document record với status='pending'
 * 5. Tăng documentCount trong category
 * 6. Trả về document đã được populate
 */
const uploadDocument = async (req, res) => {
    try {
        // 1. Kiểm tra file đã được upload bởi multer
        if (!req.file) {
            return res.status(400).json({
                status: "error",
                code: 400,
                message: "File tải lên là bắt buộc",
                errors: [
                    {
                        field: "file",
                        message: "Vui lòng chọn file PDF để tải lên",
                    },
                ],
            });
        }

        // 2. Lấy metadata từ request body
        const { title, description, category, author, publisher, publishYear } = req.body;

        // 3. Validation: Kiểm tra các field bắt buộc
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

        // 4. Kiểm tra category có tồn tại không
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Không tìm thấy danh mục",
            });
        }

        // 5. Tạo document object
        const newDocument = new Document({
            title: title.trim(),
            description: description ? description.trim() : "",
            author: author ? author.trim() : null,
            publisher: publisher ? publisher.trim() : null,
            publishYear: publishYear ? parseInt(publishYear) : null,
            categoryId: category,
            uploadedBy: req.user.id, // Từ checkAuth middleware
            fileUrl: `/uploads/${req.file.filename}`, // Mock local storage
            fileName: req.file.originalname,
            fileSize: req.file.size,
            status: "pending", // Default (sẽ được duyệt sau)
        });

        // 6. Lưu document vào database
        const savedDocument = await newDocument.save();

        // 7. QUAN TRỌNG: Tăng documentCount trong category
        await Category.findByIdAndUpdate(category, {
            $inc: { documentCount: 1 },
        });

        // 8. Populate để trả về thông tin đẹp hơn
        const populatedDoc = await Document.findById(savedDocument._id)
        .populate("uploadedBy", "name email role")
        .populate("categoryId", "name slug");

        // 9. Trả về response thành công
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
                status: populatedDoc.status,
                views: populatedDoc.views,
                downloads: populatedDoc.downloads,
                createdAt: populatedDoc.createdAt,
                },
            },
        });
    } catch (error) {
        console.error("Upload document error:", error);

        // Xử lý lỗi validation của Mongoose
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

        // Validation: Kiểm tra status hợp lệ
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

        // Validation: Nếu rejected thì reason là bắt buộc
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

        // Tìm tài liệu
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Không tìm thấy tài liệu",
            });
        }

        // Kiểm tra trạng thái hiện tại
        if (document.status !== "pending") {
            return res.status(400).json({
                status: "error",
                code: 400,
                message: "Tài liệu này đã được xử lý trước đó",
            });
        }

        // Cập nhật tài liệu
        document.status = status;
        document.reviewedBy = reviewerId;
        document.reviewedAt = new Date();

        if (status === "rejected") {
            document.rejectionReason = reason.trim();
        } else {
            document.rejectionReason = null;
        }

        // Lưu tài liệu
        await document.save();

        // Populate để trả về response đẹp
        await document.populate("reviewedBy", "name email role");
        await document.populate("categoryId", "name slug");
        await document.populate("uploadedBy", "name email role");

        // Trả về response thành công
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
        let { page, limit, q, category, year, sort, status } = req.query;
        const filters = {};

        // Phân quyền Public vs Admin
        const isAdminRoute = req.originalUrl.startsWith("/api/admin/documents");

        if (isAdminRoute) {
            if (status && ["pending", "approved", "rejected"].includes(status)) {
                filters.status = status;
            }
        } else {
            filters.status = "approved";
        }

        // Build Filters
        if (q && q.trim()) {
            filters.$text = { $search: q.trim() };
        }
        if (category) {
            filters.categoryId = category;
        }
        if (year) {
            filters.publishYear = parseInt(year);
        }

        // Build Sort
        let sortOptions = {};
        if (sort) {
            const [field, order] = sort.split(":");
            sortOptions[field] = order === "asc" ? 1 : -1;
        } else {
            sortOptions = { createdAt: -1 };
        }

        // Build Pagination
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        limit = Math.min(limit, 50);
        const skip = (page - 1) * limit;

        // Execute Query
        const totalDocuments = await Document.countDocuments(filters);
        const documents = await Document.find(filters)
            .populate("categoryId", "name slug")
            .populate("uploadedBy", "name email role")
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);

        const totalPages = Math.ceil(totalDocuments / limit);

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
                                role: doc.uploadedBy.role,
                            }
                        : null,
                    fileUrl: doc.fileUrl,
                    fileName: doc.fileName,
                    fileSize: doc.fileSize,
                    coverImage: doc.coverImage,
                    status: doc.status,
                    views: doc.views,
                    downloads: doc.downloads,
                    createdAt: doc.createdAt,
                })),
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalDocuments,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
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
 * API 2.9: Lấy chi tiết tài liệu theo ID
 * GET /api/documents/:id
 * Access: Public (nhưng có phân quyền xem tài liệu pending/rejected)
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

        // QUAN TRỌNG: Phân quyền xem tài liệu
        if (document.status === "approved") {
            // Public - ai cũng xem được
        } else {
            // pending/rejected: Chỉ Admin, Moderator, hoặc chủ sở hữu
            if (!req.user) {
                return res.status(404).json({
                    status: "error",
                    code: 404,
                    message: "Không tìm thấy tài liệu",
                });
            }

            const isAdmin = ["Admin", "Moderator"].includes(req.user.role);
            const isOwner = document.uploadedBy._id.toString() === req.user.id;

            if (!isAdmin && !isOwner) {
                return res.status(404).json({
                    status: "error",
                    code: 404,
                    message: "Không tìm thấy tài liệu",
                });
            }
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
                    coverImage: document.coverImage,
                    pageCount: document.pageCount,
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
                    rating: document.rating,
                    commentCount: document.commentCount,
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
            message: "Lỗi server khi lấy chi tiết tài liệu",
        });
    }
};

/**
 * =================================================================
 * NGÀY 5: ĐỌC VÀ TẢI TÀI LIỆU
 * =================================================================
 */

/**
 * API 2.15: Đọc trực tuyến (F12)
 * GET /api/documents/:id/read
 * Access: User, Author, Moderator, Admin (phải đăng nhập)
 * 
 * Flow:
 * 1. Kiểm tra tài liệu tồn tại và status='approved'
 * 2. Kiểm tra file tồn tại trên server
 * 3. Stream file PDF về client với header 'inline'
 */
const readDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Tìm tài liệu
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Không tìm thấy tài liệu",
            });
        }

        // 2. Kiểm tra trạng thái tài liệu
        if (document.status !== "approved") {
            return res.status(403).json({
                status: "error",
                code: 403,
                message: "Tài liệu chưa được duyệt",
            });
        }

        // 3. Lấy đường dẫn file (giả định fileUrl = "/uploads/xxx.pdf")
        // Chuyển thành đường dẫn tuyệt đối: "./uploads/xxx.pdf"
        const filePath = path.join(process.cwd(), document.fileUrl);

        // 4. Kiểm tra file tồn tại
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "File không tồn tại trên server",
            });
        }

        // 5. Set headers để hiển thị PDF trực tiếp trên trình duyệt
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename="${encodeURIComponent(document.fileName)}"`
        );

        // 6. Stream file về client
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);

        // 7. Xử lý lỗi stream
        stream.on("error", (error) => {
            console.error("Stream error:", error);
            if (!res.headersSent) {
                return res.status(500).json({
                    status: "error",
                    code: 500,
                    message: "Lỗi khi đọc file",
                });
            }
        });
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
 * API 2.12: Tải xuống (F13)
 * GET /api/documents/:id/download
 * Access: User, Author, Moderator, Admin (phải đăng nhập)
 * 
 * Flow: Tương tự readDocument, chỉ khác header Content-Disposition
 */
const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Tìm tài liệu
        const document = await Document.findById(id);

        if (!document) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Không tìm thấy tài liệu",
            });
        }

        // 2. Kiểm tra trạng thái tài liệu
        if (document.status !== "approved") {
            return res.status(403).json({
                status: "error",
                code: 403,
                message: "Tài liệu chưa được duyệt",
            });
        }

        // 3. Lấy đường dẫn file
        const filePath = path.join(process.cwd(), document.fileUrl);

        // 4. Kiểm tra file tồn tại
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "File không tồn tại trên server",
            });
        }

        // 5. Set headers để tải xuống file
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(document.fileName)}"`
        );

        // 6. Stream file về client
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);

        // 7. Xử lý lỗi stream
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
                message: "Lỗi server khi tải xuống tài liệu",
            });
        }
    }
};

/**
 * API 2.12 (Track): Ghi nhận thống kê (F14)
 * POST /api/documents/:id/track
 * Access: User, Author, Moderator, Admin (phải đăng nhập)
 * 
 * Flow:
 * 1. Lấy docId, userId, type từ request
 * 2. Sử dụng Statistic.trackAction() để ghi nhận
 * 3. Nếu là lần đầu trong ngày -> tăng counter trong document
 * 4. Nếu đã ghi nhận trước đó -> trả về success (không làm gì)
 * 
 * Logic chống spam:
 * - Compound unique index (docId, userId, type, date) trong Statistics model
 * - 1 user chỉ có thể track 1 lần/loại/tài liệu/ngày
 */
const trackDocument = async (req, res) => {
    try {
        const { id: docId } = req.params;
        const userId = req.user.id;
        const { type } = req.body;

        // 1. Validation: Kiểm tra type hợp lệ
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

        // 2. Kiểm tra tài liệu tồn tại
        const document = await Document.findById(docId);
        if (!document) {
            return res.status(404).json({
                status: "error",
                code: 404,
                message: "Không tìm thấy tài liệu",
            });
        }

        // 3. Ghi nhận thống kê (sử dụng static method trong Statistic model)
        const result = await Statistic.trackAction(docId, userId, type);

        // 4. Trả về response thành công (kể cả khi bị duplicate)
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
 * API 2.13: Lấy dashboard thống kê (F15)
 * GET /api/admin/stats
 * Access: Admin
 *
 * MVP: Bỏ qua query param 'period', thống kê toàn thời gian.
 */
const getDashboardStats = async (req, res) => {
    try {
        // 1. Overview Stats (Sử dụng Promise.all để chạy song song)
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
            // Tính tổng views/downloads từ tất cả tài liệu
            Document.aggregate([
                { $group: { _id: null, total: { $sum: "$views" } } },
            ]),
            Document.aggregate([
                { $group: { _id: null, total: { $sum: "$downloads" } } },
            ]),
            // Lấy dữ liệu danh mục
            Category.find({}).sort({ documentCount: -1 }),
        ]);

        const overview = {
            totalDocuments,
            pendingDocuments,
            activeUsers,
            totalViews: totalViewsAgg[0]?.total || 0,
            totalDownloads: totalDownloadsAgg[0]?.total || 0,
        };

        // 2. Top Viewed Documents (Top 10)
        const topViewed = await Document.find({ status: "approved" })
            .sort({ views: -1 })
            .limit(10)
            .populate("categoryId", "name")
            .select("title categoryId views author");

        // 3. Top Downloaded Documents (Top 10)
        const topDownloaded = await Document.find({ status: "approved" })
            .sort({ downloads: -1 })
            .limit(10)
            .populate("categoryId", "name")
            .select("title categoryId downloads author");

        // 4. Category Distribution
        const totalDocsInCategory = categories.reduce(
            (sum, cat) => sum + cat.documentCount,
            0
        );

        const categoryDistribution = categories.map((cat) => ({
            category: cat.name,
            documentCount: cat.documentCount,
            percentage:
                totalDocsInCategory > 0
                    ? parseFloat(((cat.documentCount / totalDocsInCategory) * 100).toFixed(2))
                    : 0,
        }));

        // 5. Trả về response theo Đặc tả API 2.13
        return res.status(200).json({
            status: "success",
            code: 200,
            message: "Lấy thống kê thành công",
            data: {
                overview,
                topViewed: topViewed.map(doc => ({
                    id: doc._id,
                    title: doc.title,
                    category: doc.categoryId?.name || 'N/A',
                    views: doc.views,
                    author: doc.author,
                })),
                topDownloaded: topDownloaded.map(doc => ({
                    id: doc._id,
                    title: doc.title,
                    category: doc.categoryId?.name || 'N/A',
                    downloads: doc.downloads,
                    author: doc.author,
                })),
                categoryDistribution,
                period: "all", // Mặc định là 'all' cho MVP
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

module.exports = {
    uploadDocument,
    reviewDocument,
    getDocuments,
    getDocumentById,
    
    // NGÀY 5: API mới
    readDocument,
    downloadDocument,
    trackDocument,
    
    // NGÀY 6: API Dashboard
    getDashboardStats,
};