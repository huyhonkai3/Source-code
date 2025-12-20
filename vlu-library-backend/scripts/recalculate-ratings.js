/**
 * MANUAL FIX SCRIPT
 * Recalculate ratings for all documents with reviews
 *
 * Run this ONCE after fixing the model to update existing data
 *
 * How to run:
 * 1. Copy this code
 * 2. Create file: vlu-library-backend/scripts/recalculate-ratings.js
 * 3. Run: node scripts/recalculate-ratings.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Import models
const Review = require("../models/review.model");
const Document = require("../models/document.model");

const recalculateAllRatings = async () => {
  try {
    console.log("🔄 Starting rating recalculation...\n");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all unique document IDs that have reviews
    const documentIds = await Review.distinct("docId");
    console.log(`📊 Found ${documentIds.length} documents with reviews\n`);

    // Recalculate rating for each document
    for (const docId of documentIds) {
      console.log(`\n⚙️  Processing document: ${docId}`);

      // Count reviews
      const reviewCount = await Review.countDocuments({ docId });
      console.log(`   Reviews: ${reviewCount}`);

      // Calculate average
      const reviews = await Review.find({ docId });
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = Math.round((totalRating / reviewCount) * 10) / 10;
      console.log(`   Average rating: ${averageRating}`);

      // Update document
      const result = await Document.findByIdAndUpdate(
        docId,
        {
          rating: averageRating,
          commentCount: reviewCount,
        },
        { new: true },
      );

      if (result) {
        console.log(`   ✅ Updated document successfully`);
      } else {
        console.log(`   ⚠️  Document not found in database`);
      }

      // Also print distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r) => distribution[r.rating]++);
      console.log(`   Distribution:`, distribution);
    }

    console.log("\n\n🎉 Rating recalculation completed!");
    console.log(`✅ Processed ${documentIds.length} documents`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

// Run the script
recalculateAllRatings();
