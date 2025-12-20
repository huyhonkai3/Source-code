const Review = require("../models/review.model");
const Document = require("../models/document.model");

/**
 * API: Thêm đánh giá mới
 * POST /api/reviews
 * Access: Authenticated
 * Body: { docId, rating, content }
 */
exports.addReview = async (req, res) => {
  try {
    const { docId, rating, content } = req.body;
    const userId = req.user.id; // Từ middleware checkAuth

    // Validation
    if (!docId || !rating) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Thông tin không đầy đủ",
        errors: [
          {
            field: "all",
            message: "Document ID và rating là bắt buộc",
          },
        ],
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Đánh giá không hợp lệ",
        errors: [
          {
            field: "rating",
            message: "Đánh giá phải từ 1 đến 5 sao",
          },
        ],
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

    // Check if user already reviewed this document
    const existingReview = await Review.findOne({ userId, docId });
    if (existingReview) {
      return res.status(409).json({
        status: "error",
        code: 409,
        message: "Bạn đã đánh giá tài liệu này rồi",
      });
    }

    // Create review
    const review = new Review({
      userId,
      docId,
      rating,
      content: content || "",
    });

    await review.save();

    // Populate user info for response
    await review.populate("userId", "name email avatarUrl");

    res.status(201).json({
      status: "success",
      code: 201,
      message: "Đánh giá đã được gửi thành công",
      data: {
        review,
      },
    });
  } catch (error) {
    console.error("Add review error:", error);

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
      message: "Lỗi server khi gửi đánh giá",
    });
  }
};

/**
 * API: Lấy danh sách đánh giá theo docId
 * GET /api/reviews/:docId
 * Access: Public
 * Query: page, limit
 */
exports.getReviewsByDocId = async (req, res) => {
  try {
    const { docId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Check if document exists
    const document = await Document.findById(docId);
    if (!document) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy tài liệu",
      });
    }

    // Count total reviews
    const totalReviews = await Review.countDocuments({ docId });

    // Fetch reviews with pagination
    const reviews = await Review.find({ docId })
      .populate("userId", "name email avatarUrl")
      .sort({ createdAt: -1 }) // Mới nhất trước
      .skip((page - 1) * limit)
      .limit(limit);

    // Calculate rating distribution
    const mongoose = require("mongoose");
    const ratingDistribution = await Review.aggregate([
      {
        $match: { docId: new mongoose.Types.ObjectId(docId) },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 }, // Sort by rating descending
      },
    ]);

    // Format rating distribution as object {5: count, 4: count, ...}
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });

    // Calculate average rating from actual reviews
    let averageRating = 0;
    if (totalReviews > 0) {
      const totalRatingSum = reviews.reduce(
        (sum, review) => sum + review.rating,
        0,
      );
      averageRating = Math.round((totalRatingSum / totalReviews) * 10) / 10;
    }

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách đánh giá thành công",
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalReviews / limit),
          totalReviews,
          limit,
        },
        statistics: {
          averageRating, // Use calculated value, not document.rating
          totalReviews,
          distribution,
        },
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi lấy danh sách đánh giá",
    });
  }
};

/**
 * API: Kiểm tra user đã review chưa
 * GET /api/reviews/check/:docId
 * Access: Authenticated
 */
exports.checkUserReview = async (req, res) => {
  try {
    const { docId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({ userId, docId });

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        hasReviewed: !!review,
        review: review || null,
      },
    });
  } catch (error) {
    console.error("Check user review error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server",
    });
  }
};

/**
 * API: Cập nhật đánh giá
 * PUT /api/reviews/:id
 * Access: Authenticated (owner only)
 */
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, content } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Check ownership - Fix: compare ObjectId string correctly
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền chỉnh sửa đánh giá này",
      });
    }

    // Update fields
    if (rating !== undefined) review.rating = rating;
    if (content !== undefined) review.content = content;

    await review.save();

    await review.populate("userId", "name email avatarUrl");

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Cập nhật đánh giá thành công",
      data: {
        review,
      },
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi cập nhật đánh giá",
    });
  }
};

/**
 * API: Xóa đánh giá
 * DELETE /api/reviews/:id
 * Access: Authenticated (owner or admin)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Check ownership or admin - Fix: compare ObjectId string correctly
    if (
      review.userId.toString() !== userId.toString() &&
      userRole !== "Admin"
    ) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "Bạn không có quyền xóa đánh giá này",
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      status: "success",
      code: 200,
      message: "Xóa đánh giá thành công",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      status: "error",
      code: 500,
      message: "Lỗi server khi xóa đánh giá",
    });
  }
};
