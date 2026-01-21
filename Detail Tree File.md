# vlu-library-backend/index.js

## Mục đích chính
Điểm khởi chạy chính của Server, thiết lập Express app, kết nối Database, cấu hình Middleware và định tuyến toàn bộ API.

**Độ tin cậy:** HIGH

File chứa đầy đủ logic khởi tạo, import routes và xử lý lỗi global.

## Bằng chứng từ code (Evidence)
- Import thư viện: `const express = require("express");` (dòng 2)
- Cấu hình CORS: `app.use(cors({ origin: process.env.FRONTEND_URL || "*", ... }));` (dòng 27-30)
- Định tuyến Auth: `app.use("/api/auth", authRoutes);` (dòng 53)
- Kết nối DB & Start: `await connectDB(); ... app.listen(PORT, ...)` (dòng 108, 111)

## Thành phần chính
- **app:** Express Application instance.
- **startServer:** Hàm async khởi động kết nối DB và lắng nghe request.

## Backend
### Route Mounting (Gắn kết các nhóm API)
- `/api/auth`: Các route xác thực (Đăng ký, Đăng nhập).
- `/api/categories`: Route danh mục (Public & Admin).
- `/api/admin/categories`: Route quản lý danh mục (Admin).
- `/api/documents`: Route tài liệu (Public & User).
- `/api/admin/documents`: Route quản lý tài liệu (Admin).
- `/api/comments`: Route bình luận.
- `/api/admin/users`: Route quản lý người dùng (Admin).
- `/api/users`: Route thông tin cá nhân (User).
- `/api/reviews`: Route đánh giá.

### Static File Serving
Phục vụ file từ thư mục `/uploads`.

## Frontend (nếu có)
Không áp dụng (File backend).

## Dependency
### Nội bộ
- `./config/database`: Hàm `connectDB`.
- `./routes/*.routes`: Các file định tuyến cho từng module (auth, category, document, comment, user, review).

### Bên ngoài
- `express`: Web framework.
- `cors`: Xử lý Cross-Origin Resource Sharing.
- `dotenv`: Load biến môi trường.
- `multer`: Xử lý lỗi liên quan đến upload (MulterError).
- `fs`: Module hệ thống tệp tin (tạo thư mục uploads).

## Side effects
### System
Tạo thư mục `./uploads` nếu chưa tồn tại (dòng 41-44).

### Network
Mở cổng (PORT 5000 mặc định) lắng nghe kết nối HTTP.

### Database
Thiết lập kết nối đến MongoDB.

### Console
Log thông tin server khi khởi động.

## Ghi chú bảo mật
- **CORS:** Đang cho phép fallback là `*` (dòng 28), cần cấu hình cụ thể domain frontend trong production để tránh CSRF/unauthorized access.
- **Error Handling:** Ẩn stack trace lỗi nếu `NODE_ENV` không phải là development (dòng 92).

## TODO / Nhận xét kỹ thuật
Server đang lưu trữ file upload cục bộ tại `./uploads`, sẽ gặp vấn đề nếu deploy trên server dạng stateless (như Vercel/Heroku) → Cần chuyển sang Cloud Storage (AWS S3/Firebase).

Cấu trúc API route phân chia rõ ràng giữa `/api` (chung) và `/api/admin` (quản trị).


# vlu-library-backend/config/database.js

## Mục đích chính
Thiết lập và quản lý kết nối từ ứng dụng Express đến cơ sở dữ liệu MongoDB thông qua thư viện Mongoose.

**Độ tin cậy:** HIGH

File ngắn gọn, tập trung vào một nhiệm vụ duy nhất và xử lý lỗi kết nối đầy đủ.

## Bằng chứng từ code (Evidence)
- Kết nối Mongoose: `const conn = await mongoose.connect(process.env.MONGO_URI, { ... });` (dòng 9)
- Xử lý lỗi kết nối: `process.exit(1);` (dòng 24)
- Log trạng thái: `console.log(\`✅ MongoDB Connected: ${conn.connection.host}\`);` (dòng 14)

## Thành phần chính
- **connectDB:** Hàm async export public dùng để khởi tạo kết nối.

## Backend
Không trực tiếp định nghĩa API endpoint, nhưng là nền tảng cho mọi thao tác dữ liệu (DB read/write) của toàn bộ hệ thống.

## Frontend (nếu có)
Không áp dụng.

## Dependency
### Nội bộ
Không có (chỉ dùng các biến môi trường).

### Bên ngoài
- **mongoose:** ODM (Object Data Modeling) library cho MongoDB.

## Side effects
### Network
Mở kết nối TCP đến MongoDB server.

### Process Control
Thoát ứng dụng (`process.exit(1)`) nếu kết nối thất bại ngay từ đầu (Critical Failure).

### Event Listeners
Đăng ký lắng nghe sự kiện `error` và `disconnected` trên `mongoose.connection`.

## Ghi chú bảo mật
Sử dụng `process.env.MONGO_URI` để tránh hardcode connection string trong code (dòng 9).

## TODO / Nhận xét kỹ thuật
Code đã loại bỏ các options deprecated (`useNewUrlParser`, `useUnifiedTopology`) phù hợp với Mongoose 6+.

Xử lý sự kiện `disconnected` chỉ log cảnh báo, chưa có logic tự động reconnect (mặc dù Mongoose driver thường có auto-reconnect mặc định).


# vlu-library-backend/models/document.model.js

## Mục đích chính
Định nghĩa cấu trúc dữ liệu (Schema) cho tài liệu thư viện, bao gồm các trường metadata, trạng thái kiểm duyệt, và thống kê lượt xem/tải.

**Độ tin cậy:** HIGH

Schema chi tiết, có validation, virtual fields, và các helper methods (static/instance methods).

## Bằng chứng từ code (Evidence)
- Định nghĩa Schema: `const documentSchema = new mongoose.Schema({ ... });` (dòng 34)
- Trường trạng thái: `status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }` (dòng 115)
- Virtual field URL: `documentSchema.virtual("fullFileUrl").get(function () { ... });` (dòng 155)
- Method tăng view: `documentSchema.methods.incrementViews = async function () { ... };` (dòng 173)

## Thành phần chính
- **documentSchema:** Mongoose Schema chính.
- **wikidataInfoSchema:** Schema nhúng (embedded) cho thông tin liên kết dữ liệu (Linked Data).
- **Các virtuals:** `fullFileUrl`, `isEpub`, `isPdf`.
- **Các instance methods:** `incrementViews`, `incrementDownloads`.
- **Các static methods:** `findApproved`, `findPending`, `findByFormat`.

## Backend
### DB Write
Create (upload), Update (duyệt, tăng view/download), Delete.

### DB Read
Tìm kiếm, lọc theo danh mục, định dạng, tác giả.

## Frontend (nếu có)
Không áp dụng trực tiếp, nhưng cấu trúc JSON trả về cho Frontend sẽ tuân theo Schema này (bao gồm cả các trường virtuals nếu cấu hình `toJSON: { virtuals: true }`).

## Dependency
### Nội bộ
Không có.

### Bên ngoài
- **mongoose:** Để định nghĩa Schema và Model.

## Side effects
### Validation
Tự động kiểm tra độ dài chuỗi, định dạng enum trước khi lưu vào DB.

### Timestamping
Tự động tạo `createdAt` và `updatedAt` (dòng 150).

## Ghi chú bảo mật
### Validation
Các trường như `title`, `description` có giới hạn độ dài (maxlength) để tránh tấn công DoS database.

### URL Handling
Virtual `fullFileUrl` tự động thêm domain server vào đường dẫn file local, giúp che giấu cấu trúc thư mục thực tế với client.

## TODO / Nhận xét kỹ thuật
- Đã thiết kế sẵn trường `wikidataInfo` cho tính năng Linked Open Data (LOD) trong tương lai.
- Sử dụng biến môi trường `process.env.BASE_URL` trong virtual field là thực hành tốt để linh hoạt giữa dev/prod.
- Logic kiểm tra `fileFormat` (enum: pdf, epub) được hỗ trợ bởi các virtual method `isPdf`, `isEpub` tiện lợi.
