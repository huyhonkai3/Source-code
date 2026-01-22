require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const multer = require("multer");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/auth.routes");
const categoryPublicRoutes = require("./routes/category.public.routes");
const categoryAdminRoutes = require("./routes/category.admin.routes");
const documentRoutes = require("./routes/document.routes");
const documentAdminRoutes = require("./routes/document.admin.routes");
const commentRoutes = require("./routes/comment.routes");
// const lodRoutes = require("./routes/lod.routes");
const userAdminRoutes = require("./routes/user.admin.routes");
const userRoutes = require("./routes/user.routes"); // Route cho User thường
const reviewRoutes = require("./routes/review.routes"); // Route cho Review

// Khởi tạo Express app
const app = express();

/**
 * Middleware Configuration
 */

// CORS - Cho phép Frontend gọi API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // Trong production nên set cụ thể domain Frontend
    credentials: true,
  }),
);

// Body parser - Xử lý JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Tạo thư mục uploads nếu chưa tồn tại (cho MVP local storage)
const uploadDir = "./uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Phục vụ file tĩnh từ thư mục uploads
app.use("/uploads", express.static("uploads"));

// Request logging middleware (development)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * API Routes
 */

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "VLU Digital Library API - Backend Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    message: "API is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Mount authentication routes
app.use("/api/auth", authRoutes); // Đăng ký, Đăng nhập, Refresh token, đổi mật khẩu
// Mount Admin routes
app.use("/api/admin", userAdminRoutes); // Quản lý User (Admin)
// Mount user routes
app.use("/api/users", userRoutes); // Route cho User thường
// Mount category routes
app.use("/api/categories", categoryPublicRoutes); // Public API (GET /)
app.use("/api/admin/categories", categoryAdminRoutes); // Admin APIs (POST, PUT, DELETE)
// Mount document routes
app.use("/api/documents", documentRoutes); // Document APIs
app.use("/api/admin/documents", documentAdminRoutes);
// Comments & Interaction
app.use("/api/comments", commentRoutes);
// Mount review routes
app.use("/api/reviews", reviewRoutes);

/**
 * Error Handling Middleware
 */

// Middleware xử lý lỗi Multer (file size, file type)
app.use((err, req, res, next) => {
  // Multer error - File quá lớn
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        status: "error",
        code: 413,
        message: "File quá lớn",
        errors: [
          {
            field: "file",
            message: "Kích thước file không được vượt quá 50MB",
          },
        ],
      });
    }
    // Các lỗi Multer khác
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Lỗi khi xử lý file",
      errors: [
        {
          field: "file",
          message: err.message,
        },
      ],
    });
  }

  // Lỗi custom từ fileFilter
  if (err.message === "Chỉ chấp nhận file PDF!") {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "File không hợp lệ",
      errors: [
        {
          field: "file",
          message: "Chỉ chấp nhận file PDF",
        },
      ],
    });
  }

  // Chuyển lỗi khác cho global handler
  next(err);
});

// 404 handler - Route không tồn tại
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: "Route không tồn tại",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      code: 400,
      message: "Dữ liệu không hợp lệ",
      errors: Object.values(err.errors).map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      status: "error",
      code: 409,
      message: `${field} đã tồn tại`,
      errors: [
        {
          field,
          message: `${field} này đã được sử dụng`,
        },
      ],
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Token không hợp lệ",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Token đã hết hạn",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    status: "error",
    code: err.status || 500,
    message: err.message || "Lỗi server",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

/**
 * Server Startup
 */

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Kết nối database trước
    await connectDB();

    // Sau đó mới start server
    app.listen(PORT, () => {
      console.log(`\nServer is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`API URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n⚠️  SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n⚠️  SIGINT received, shutting down gracefully...");
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
