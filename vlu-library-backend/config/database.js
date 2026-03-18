const mongoose = require("mongoose");

/**
 * Kết nối đến MongoDB
 * Sử dụng mongoose với cấu hình từ biến môi trường MONGO_URI
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Các options mới cho Mongoose 6+
      // useNewUrlParser và useUnifiedTopology đã bị deprecated
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Lắng nghe các sự kiện database
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1); // Thoát process với mã lỗi
  }
};

module.exports = connectDB;