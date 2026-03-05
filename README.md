# 📚 VLU Digital Library

Hệ thống thư viện số của Trường Đại học Văn Lang — hỗ trợ quản lý tài liệu, phân quyền người dùng đa cấp, và tích hợp đăng nhập bằng tài khoản Microsoft Outlook `@vanlanguni.vn`.

---

## 📑 Mục lục

1. [Công nghệ sử dụng](#1-công-nghệ-sử-dụng)
2. [Yêu cầu hệ thống](#2-yêu-cầu-hệ-thống)
3. [Hướng dẫn cài đặt](#3-hướng-dẫn-cài-đặt)
4. [Thiết lập Microsoft Entra ID](#4-thiết-lập-microsoft-entra-id)
5. [Chạy ứng dụng](#5-chạy-ứng-dụng)

---

## 1. Công nghệ sử dụng

### 🖥️ Backend (`vlu-library-backend`)

| Thư viện             | Phiên bản | Mô tả                                         |
| -------------------- | --------- | --------------------------------------------- |
| `express`            | ^5.1.0    | Web framework chính cho Node.js               |
| `mongoose`           | ^8.19.3   | ODM để kết nối và thao tác với MongoDB        |
| `jsonwebtoken`       | ^9.0.2    | Xác thực người dùng bằng JWT                  |
| `bcryptjs`           | ^3.0.3    | Mã hoá mật khẩu                               |
| `multer`             | ^2.0.2    | Xử lý upload file                             |
| `multer-s3`          | ^3.0.1    | Upload file trực tiếp lên AWS S3              |
| `@aws-sdk/client-s3` | ^3.971.0  | AWS SDK để tương tác với S3                   |
| `axios`              | ^1.13.2   | HTTP client để gọi API ngoài (Wikidata, v.v.) |
| `cors`               | ^2.8.5    | Xử lý Cross-Origin Resource Sharing           |
| `dotenv`             | ^17.3.1   | Quản lý biến môi trường từ file `.env`        |
| `recharts`           | ^3.6.0    | Thư viện biểu đồ (dùng cho thống kê)          |
| `nodemon` _(dev)_    | ^3.1.10   | Tự động restart server khi có thay đổi        |

### 🌐 Frontend (`vlu-library-frontend`)

| Thư viện              | Phiên bản | Mô tả                                            |
| --------------------- | --------- | ------------------------------------------------ |
| `react`               | 18.2.0    | Thư viện UI chính                                |
| `react-dom`           | 18.2.0    | Render React vào DOM                             |
| `react-router-dom`    | ^6.28.0   | Điều hướng (routing) trong SPA                   |
| `axios`               | ^1.13.2   | HTTP client để gọi Backend API                   |
| `@mui/material`       | ^5.15.14  | Thư viện component UI theo Material Design       |
| `@mui/icons-material` | ^5.15.14  | Bộ icon Material UI                              |
| `@emotion/react`      | ^11.11.1  | CSS-in-JS (dependency của MUI)                   |
| `@emotion/styled`     | ^11.11.0  | Styled components (dependency của MUI)           |
| `@azure/msal-browser` | ^4.27.0   | Microsoft Authentication Library cho trình duyệt |
| `@azure/msal-react`   | ^3.0.23   | MSAL wrapper cho React (đăng nhập Microsoft)     |
| `pdfjs-dist`          | ^5.4.449  | Đọc và hiển thị file PDF                         |
| `epubjs`              | ^0.3.93   | Đọc và hiển thị file EPUB                        |
| `recharts`            | ^3.6.0    | Biểu đồ thống kê                                 |
| `date-fns`            | ^4.1.0    | Xử lý và định dạng ngày tháng                    |
| `react-scripts`       | 5.0.1     | Công cụ build của Create React App               |

---

## 2. Yêu cầu hệ thống

Đảm bảo máy tính của bạn đã cài đặt đầy đủ các công cụ sau trước khi bắt đầu:

| Công cụ                             | Phiên bản tối thiểu       | Kiểm tra        |
| ----------------------------------- | ------------------------- | --------------- |
| [Node.js](https://nodejs.org/)      | >= 18.x                   | `node -v`       |
| [npm](https://www.npmjs.com/)       | >= 9.x (đi kèm Node.js)   | `npm -v`        |
| [Git](https://git-scm.com/)         | >= 2.x                    | `git --version` |
| [MongoDB](https://www.mongodb.com/) | >= 6.x (Local hoặc Atlas) | —               |

> **💡 Đề xuất:** Nên sử dụng [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud miễn phí) để dễ thiết lập, không cần cài MongoDB local.

---

## 3. Hướng dẫn cài đặt

### Bước 1: Clone dự án và cài đặt dependencies

**1.1 — Clone repository về máy:**

```bash
git clone https://github.com/<your-username>/Source-code.git
cd Source-code
```

**1.2 — Cài đặt dependencies cho Backend:**

```bash
cd vlu-library-backend
npm install
```

**1.3 — Cài đặt dependencies cho Frontend:**

```bash
cd ../vlu-library-frontend
npm install
```

---

### Bước 2: Cấu hình biến môi trường (Environment Variables)

#### 2.1 — Backend (`vlu-library-backend/.env`)

Tạo file `.env` trong thư mục `vlu-library-backend/`:

```bash
cd vlu-library-backend
# tạo mới file .env:
touch .env
```

Nội dung file `.env` như sau:

```env
# ========================
# SERVER
# ========================
PORT=5000
NODE_ENV=development

# ========================
# DATABASE
# ========================
# MongoDB Local:
MONGODB_URI=mongodb://localhost:27017/vlu_library
# MongoDB Atlas (thay thế bằng connection string của bạn):
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/vlu_library

# ========================
# JWT AUTHENTICATION
# ========================
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_REFRESH_EXPIRES_IN=30d

# ========================
# AWS S3 (Lưu trữ file PDF/EPUB)
# ========================
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET_NAME=vlu-library-bucket

# ========================
# MICROSOFT ENTRA ID (Azure AD)
# ========================
AZURE_AD_TENANT_ID=your_tenant_id
AZURE_AD_CLIENT_ID=your_client_id
AZURE_AD_CLIENT_SECRET=your_client_secret

# ========================
# FRONTEND URL (CORS)
# ========================
CLIENT_URL=http://localhost:3000
```

#### 2.2 — Frontend (`vlu-library-frontend/.env`)

Tạo file `.env` trong thư mục `vlu-library-frontend/`:

```bash
cd vlu-library-frontend
touch .env
```

Nội dung file `.env`:

```env
# ========================
# BACKEND API
# ========================
REACT_APP_API_URL=http://localhost:5000/api

# ========================
# MICROSOFT ENTRA ID (Azure AD)
# ========================
REACT_APP_AZURE_CLIENT_ID=your_client_id
REACT_APP_AZURE_TENANT_ID=your_tenant_id
REACT_APP_AZURE_REDIRECT_URI=http://localhost:3000
```

> 💡 Tất cả biến môi trường trong React **bắt buộc** phải có tiền tố `REACT_APP_` mới được nhận diện.

---

## 4. Thiết lập Microsoft Entra ID

Phần này hướng dẫn tạo và cấu hình ứng dụng trên **Microsoft Azure** để cho phép đăng nhập bằng tài khoản Outlook `@vanlanguni.vn`.

### Bước 1: Tạo App Registration trên Azure Portal

1. Truy cập [https://portal.azure.com](https://portal.azure.com) và đăng nhập.
2. Tìm kiếm **"Microsoft Entra ID"** (trước đây là Azure Active Directory) và chọn vào.
3. Trong menu trái, chọn **App registrations** → **New registration**.
4. Điền thông tin đăng ký:

   | Trường | Giá trị |
   |---|---|
   | **Name** | `VLU Digital Library` (hoặc tên tuỳ ý) |
   | **Supported account types** | `Any Microsoft Entra ID tenant + Personal Microsoft accounts` |
   | **Redirect URI** | `Single-page application (SPA)` → `http://localhost:3000` |

5. Nhấn **Register**.

> ℹ️ Chọn **"Any Microsoft Entra ID tenant + Personal Microsoft accounts"**: cấu hình `authority: "common"` trong `authConfig.js` cho phép cả tài khoản trường (`@vanlanguni.vn`) lẫn tài khoản Microsoft cá nhân đăng nhập.

---

### Bước 2: Lấy thông tin Client ID và Tenant ID

Sau khi đăng ký, Azure sẽ chuyển đến trang **Overview** của app. Lưu lại 2 giá trị sau:

```
Application (client) ID  →  dùng cho REACT_APP_AZURE_CLIENT_ID và AZURE_AD_CLIENT_ID
Directory (tenant) ID    →  dùng cho REACT_APP_AZURE_TENANT_ID và AZURE_AD_TENANT_ID
```

---

### Bước 3: Cấu hình Redirect URIs

1. Trong trang app, chọn **Authentication** (menu trái).
2. Tại mục **Single-page application**, đảm bảo đã có URI:
   - `http://localhost:3000` *(cho môi trường development)*
3. Khi deploy production, thêm URI của domain, ví dụ:
   - `https://library.vanlanguni.vn`
4. Tại mục **Implicit grant and hybrid flows**, **KHÔNG** tick vào `Access tokens` hay `ID tokens` — MSAL hiện đại dùng Authorization Code Flow with PKCE, không cần implicit flow.
5. Nhấn **Save**.

---

### Bước 4: Cập nhật file cấu hình Frontend

Mở file `vlu-library-frontend/src/config/authConfig.js` và đảm bảo `clientId` khớp với App Registration của bạn:

```js
export const msalConfig = {
  auth: {
    clientId: "your_client_id_here",           // ← Application (client) ID
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "http://localhost:3000",       // ← Phải trùng với Redirect URI trên Azure
  },
  // ...
};

export const loginRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};
```

---

## 5. Chạy ứng dụng

### Khởi động Backend

Mở terminal, điều hướng vào thư mục backend và chạy:

```bash
cd vlu-library-backend
npm run dev
```

Nếu thành công, bạn sẽ thấy:

```
[nodemon] starting `node index.js`
🚀 Server đang chạy tại: http://localhost:5000
✅ Kết nối MongoDB thành công
```

---

### Khởi động Frontend

Mở **terminal mới** (giữ nguyên terminal backend), điều hướng vào thư mục frontend:

```bash
cd vlu-library-frontend
npm start
```

Trình duyệt sẽ tự động mở tại `http://localhost:3000`.

---

### Tổng quan cổng (Ports)

| Dịch vụ | URL | Ghi chú |
|---|---|---|
| **Frontend** | `http://localhost:3000` | React dev server |
| **Backend API** | `http://localhost:5000` | Express server |
| **MongoDB Local** | `mongodb://localhost:27017` | Nếu dùng local |
