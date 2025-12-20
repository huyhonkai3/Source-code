const mongoose = require("mongoose");

/**
 * Review Schema
 * Lưu trữ đánh giá của người dùng về tài liệu
 *
 * Business Logic:
 * - Mỗi user chỉ được đánh giá 1 lần cho 1 document
 * - Rating: 1-5 sao
 * - Khi có review mới hoặc update → tự động tính lại averageRating của Document
 */
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID là bắt buộc"],
    },

    docId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document ID là bắt buộc"],
    },

    rating: {
      type: Number,
      required: [true, "Đánh giá là bắt buộc"],
      min: [1, "Đánh giá tối thiểu là 1 sao"],
      max: [5, "Đánh giá tối đa là 5 sao"],
    },

    content: {
      type: String,
      trim: true,
      maxlength: [1000, "Nội dung đánh giá không được vượt quá 1000 ký tự"],
      default: "",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

/**
 * Indexes
 * - Compound index để đảm bảo 1 user chỉ review 1 doc 1 lần
 * - Index cho query
 */
reviewSchema.index({ userId: 1, docId: 1 }, { unique: true });
reviewSchema.index({ docId: 1, createdAt: -1 }); // Lấy reviews mới nhất

/**
 * Static Method: Calculate average rating for a document
 * Tính toán rating trung bình và số lượng review
 */
reviewSchema.statics.calculateDocumentRating = async function (docId) {
  try {
    const stats = await this.aggregate([
      {
        $match: { docId: new mongoose.Types.ObjectId(docId) },
      },
      {
        $group: {
          _id: "$docId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    // Update Document model
    const Document = mongoose.model("Document");

    if (stats.length > 0) {
      await Document.findByIdAndUpdate(docId, {
        rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
        commentCount: stats[0].reviewCount,
      });
      console.log(
        `✅ Updated document ${docId} rating to ${Math.round(stats[0].averageRating * 10) / 10}`,
      );
    } else {
      // No reviews - reset to null
      await Document.findByIdAndUpdate(docId, {
        rating: null,
        commentCount: 0,
      });
      console.log(`✅ Reset document ${docId} rating (no reviews)`);
    }
  } catch (error) {
    console.error("❌ Calculate rating error:", error);
  }
};

/**
 * Post-save Hook: Update document rating after save
 */
reviewSchema.post("save", async function () {
  console.log("🔄 Review saved, updating document rating for:", this.docId);
  try {
    await this.constructor.calculateDocumentRating(this.docId);
  } catch (error) {
    console.error("❌ Post-save hook error:", error);
  }
});

/**
 * Post-remove Hook: Update document rating after delete
 */
reviewSchema.post("remove", async function () {
  await this.constructor.calculateDocumentRating(this.docId);
});

/**
 * Post-findOneAndUpdate Hook: Update document rating after update
 */
reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await doc.constructor.calculateDocumentRating(doc.docId);
  }
});

/**
 * Post-findOneAndDelete Hook: Update document rating after delete
 */
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateDocumentRating(doc.docId);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
