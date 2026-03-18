/**
 * Script fix lỗi E11000 duplicate key cho microsoftId index
 * Chạy: node fix-microsoftId-index.js
 * (Đặt file này vào thư mục gốc của backend, cạnh index.js)
 */
require("dotenv").config();
const mongoose = require("mongoose");

const fix = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected!");

    const db = mongoose.connection.db;
    const collection = db.collection("users");

    // Xem các index hiện tại
    const indexes = await collection.indexes();
    console.log("\nCurrent indexes:");
    indexes.forEach((idx) => console.log(" -", idx.name, JSON.stringify(idx)));

    // Drop index cũ nếu tồn tại
    const hasBadIndex = indexes.find((idx) => idx.name === "microsoftId_1");
    if (hasBadIndex) {
      await collection.dropIndex("microsoftId_1");
      console.log("\n✅ Dropped old microsoftId_1 index");
    } else {
      console.log("\nℹ️  Index microsoftId_1 not found, skipping drop");
    }

    // Tạo lại index đúng với sparse: true
    await collection.createIndex(
      { microsoftId: 1 },
      { unique: true, sparse: true, name: "microsoftId_1" },
    );
    console.log("✅ Recreated microsoftId_1 index with sparse: true");

    // Verify
    const newIndexes = await collection.indexes();
    const newIdx = newIndexes.find((idx) => idx.name === "microsoftId_1");
    console.log("\n✅ Verified new index:", JSON.stringify(newIdx));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected. Done!");
  }
};

fix();
