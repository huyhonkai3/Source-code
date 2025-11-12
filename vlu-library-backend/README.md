# VLU Digital Library - Backend API (MVP)

Backend API cho hệ thống Thư viện số Đại học Văn Lang (VLU)

## 📋 Tính năng đã triển khai

### ✅ Ngày 1 - Module Xác thực (Authentication)
- ✅ **API 1.1**: Đăng ký tài khoản (POST /api/auth/register)
- ✅ **API 1.2**: Đăng nhập (POST /api/auth/login)
- ✅ **API 1.10**: Làm mới Access Token (POST /api/auth/refresh)

### ✅ Ngày 2 - Middleware & Module Quản lý Danh mục
- ✅ **Middleware**: checkAuth - Xác thực JWT
- ✅ **Middleware**: checkRole - Phân quyền theo vai trò
- ✅ **API 2.1**: Tạo danh mục mới (POST /api/admin/categories)
- ✅ **API 2.2**: Cập nhật danh mục (PUT /api/admin/categories/:id)
- ✅ **API 2.3**: Xóa danh mục (DELETE /api/admin/categories/:id)
- ✅ **API 2.4**: Lấy danh sách danh mục (GET /api/categories)

### Chi tiết kỹ thuật
- **JWT Authentication**: Access Token (1 giờ) + Refresh Token (7 ngày)
- **Token Rotation**: Refresh token được tạo mới mỗi lần làm mới
- **Authorization**: Role-based access control (RBAC)
- **Protected Routes**: Middleware checkAuth + checkRole
- **Password Security**: Bcrypt hashing với salt 10 rounds
- **Email Validation**: Chỉ chấp nhận email @vanlanguni.vn
- **MVP**: Tài khoản tự động active (mock email activation)

## 🛠️ Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Environment**: dotenv
- **CORS**: cors middleware
- **File Upload**: multer (sẵn sàng cho Ngày 3)

## 📁 Cấu trúc thư mục

```
vlu-library-backend/
├── config/
│   └── database.js              # Kết nối MongoDB
├── controllers/
│   ├── auth.controller.js       # Logic xử lý Authentication
│   └── category.controller.js   # Logic xử lý Category
│   └── document.controller.js   # Upload logic
├── models/
│   ├── user.model.js            # Schema User
│   ├── refreshToken.model.js    # Schema RefreshToken
│   └── category.model.js        # Schema Category
│   └── document.model.js        # Document schema
├── middleware/
│   └── auth.middleware.js       # Authentication & Authorization
│   └── upload.middleware.js     # Multer config
├── routes/
│   ├── auth.routes.js           # Routes Authentication
│   ├── category.admin.routes.js # Admin Category Routes
│   └── category.public.routes.js # Public Category Routes
│   └── document.routes.js       # API routes
├── uploads/                       # Auto-created for file storage
│   └── 1731337200000-xxx.pdf
├── .env                         # Biến môi trường
├── .env.example                 # Template biến môi trường
├── .gitignore                   # Git ignore rules
├── index.js                     # Server entry point
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

## 🚀 Cài đặt & Chạy

### 1. Cấu hình biến môi trường

Cấu hình file `.env`:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/vlu_library
# Hoặc dùng MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vlu_library

# JWT Secret Keys (ĐỔI MẬT KHẨU MỚI CHO PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# JWT Expiration
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Server Port
PORT=5000

# Node Environment
NODE_ENV=development
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

---

## 🔐 Module 1: Authentication APIs

### 1. Health Check
**GET /** hoặc **GET /api/health**

### 2. Đăng ký tài khoản (API 1.1)

### 3. Đăng nhập (API 1.2)
**POST /api/auth/login**

### 4. Làm mới Access Token (API 1.10)
**POST /api/auth/refresh**

---

## 📚 Module 2: Category Management APIs (NEW)

### 5. Tạo danh mục mới (API 2.1) - ✨ ADMIN ONLY
**POST /api/admin/categories**

### 6. Cập nhật danh mục (API 2.2) - ✨ ADMIN ONLY
**PUT /api/admin/categories/:id**

### 7. Xóa danh mục (API 2.3) - ✨ ADMIN ONLY
**DELETE /api/admin/categories/:id**

### 8. Lấy danh sách tất cả danh mục (API 2.4) - ✨ PUBLIC
**GET /api/categories**

---

## 🗄️ Database Schema

### Collection: users

### Collection: refreshTokens

### Collection: categories

### Collection: document
---

## 🔐 Security Features

1. **Password Hashing**: Bcrypt với salt 10 rounds
2. **JWT Authentication**: 
   - Access Token: 1 giờ (ngắn hạn, chứa user info + role)
   - Refresh Token: 7 ngày (dài hạn, chỉ chứa userId)
3. **Token Rotation**: Refresh token được tạo mới mỗi lần refresh
4. **Token Revocation**: Refresh token cũ bị xóa sau khi rotate
5. **TTL Index**: Token hết hạn tự động xóa khỏi database
6. **Email Validation**: Chỉ chấp nhận @vanlanguni.vn
7. **Account Locking**: Hỗ trợ khóa tài khoản với lý do
8. **✨ Authorization Middleware**: Role-based access control
   - checkAuth: Verify JWT và gắn req.user
   - checkRole: Kiểm tra vai trò user (Admin, Moderator, Author, User)
9. **✨ Protected Routes**: Admin APIs yêu cầu role Admin

---

## 🎯 Middleware System

### checkAuth Middleware
**Xử lý:**
1. Lấy token từ header `Authorization: Bearer <token>`
2. Verify token với JWT_SECRET
3. Tìm user trong database
4. Kiểm tra user.status !== 'locked'
5. Gắn user info vào `req.user = { id, role, email }`

**Error Cases:**
- 401: Token không được cung cấp
- 401: Token không hợp lệ hoặc hết hạn
- 401: User không tồn tại
- 403: Tài khoản bị khóa

### checkRole Middleware
**Xử lý:**
1. Kiểm tra `req.user` tồn tại (checkAuth đã chạy)
2. Kiểm tra `req.user.role` có trong danh sách cho phép
3. Cho phép hoặc từ chối request

### upload Middleware
**Xử lý:**
1. Kiểm tra file tải lên có phải là file PDF
2. Kiểm tra file có vươt quá 50MB
3. Cho phép hoăc từ chối tải lên

---

## 📝 Lưu ý MVP (Kế hoạch 6 ngày)

### Đã triển khai (Ngày 1-2-3):
- ✅ Setup project và dependencies
- ✅ Kết nối MongoDB
- ✅ User, RefreshToken, Category, Documents models
- ✅ 3 API xác thực cơ bản
- ✅ Authentication & Authorization middleware
- ✅ 4 API quản lý danh mục
- ✅ 1 API upload file PDF
### Giản lược so với đặc tả:
- 🔄 **Email Activation**: Tài khoản tự động active (không gửi email)
- 🔄 **User Status**: Chỉ có 'active' và 'locked' (bỏ 'pending_activation')

### Kế hoạch tiếp theo:
**Ngày 4:**
- Document approval API (F7)
- Search & filter API (F11)
- Public document listing
- Document detail API

**Ngày 5:**
- Read online (PDF.js integration)
- Download API (F13)
- View/Download tracking (F14)

**Ngày 6:**
- Testing & bug fixes
- Dashboard stats API (F15)
- Polish UI/UX
- Deployment

---

## 📚 Tài liệu tham khảo

- [Đặc tả API](../docs/Đặc_tả_API.docx)
- [Database Collection](../docs/Database_Collection.docx)
- [Kế hoạch MVP 6 ngày](../docs/Ke_Hoach_MVP_6_Ngay.docx)
- [Sequence Diagram](../docs/Sequence_Diagram_Text.docx)

---

## 👥 Team

- Backend Developer: Trần Quý Huy
- Frontend Developer:

---

## 📄 License

ISC License - VLU Digital Library Project 2025

---

**Last Updated:** Ngày 2/6 - 11/11/2025  
**Status:** ✅ Authentication, Category Management, Upload file PDF Complete