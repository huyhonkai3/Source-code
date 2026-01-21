└── vlu-library-backend/
    ├── config/
    │   └── database.js  # Cấu hình kết nối MongoDB sử dụng Mongoose. (vlu-library-backend/config/database.js:1)
    │
    ├── controllers/
    │   ├── auth.controller.js  # Xử lý đăng ký, đăng nhập, làm mới token và đăng xuất.
    │   ├── category.controller.js  # CRUD cho danh mục tài liệu.
    │   ├── comment.controller.js  # Quản lý thêm, sửa, xóa bình luận trên tài liệu.
    │   ├── document.controller.js  # Xử lý tải lên, tìm kiếm, xem chi tiết và tải xuống tài liệu.
    │   ├── review.controller.js  # Xử lý đánh giá và xếp hạng tài liệu.
    │   ├── user.admin.controller.js  # API dành cho admin quản lý người dùng và thống kê.
    │   └── user.controller.js  # Quản lý thông tin cá nhân người dùng và đổi mật khẩu.
    │
    ├── middleware/
    │   ├── auth.middleware.js  # Xác thực JWT token và phân quyền người dùng.
    │   ├── auth.optional.middleware.js  # Middleware xác thực không bắt buộc (cho khách xem tài liệu).
    │   └── upload.middleware.js  # Cấu hình Multer để xử lý tải lên tệp (PDF, EPUB, ảnh).
    │
    ├── models/
    │   ├── category.model.js  # Schema Mongoose cho danh mục.
    │   ├── comment.model.js  # Schema Mongoose cho bình luận.
    │   ├── document.model.js  # Schema Mongoose cho tài liệu thư viện.
    │   ├── refreshToken.model.js  # Schema lưu trữ refresh token để cấp phát lại access token.
    │   ├── review.model.js  # Schema cho đánh giá và xếp hạng sao.
    │   ├── statistics.model.js  # Schema lưu trữ thống kê hệ thống (lượt xem, tải xuống).
    │   ├── upgradeRequest.model.js  # Schema yêu cầu nâng cấp quyền tác giả.
    │   └── user.model.js  # Schema thông tin người dùng và vai trò.
    │
    ├── routes/
    │   ├── auth.routes.js  # Định tuyến API xác thực.
    │   ├── category.admin.routes.js  # Định tuyến quản lý danh mục (Admin).
    │   ├── category.public.routes.js  # Định tuyến xem danh mục (Public).
    │   ├── comment.routes.js  # Định tuyến API bình luận.
    │   ├── document.admin.routes.js  # Định tuyến quản lý tài liệu (Admin/Mod).
    │   ├── document.routes.js  # Định tuyến tài liệu công khai và người dùng.
    │   ├── review.routes.js  # Định tuyến API đánh giá.
    │   ├── user.admin.routes.js  # Định tuyến quản trị người dùng.
    │   └── user.routes.js  # Định tuyến cá nhân người dùng.
    │
    ├── scripts/
    │   └── recalculate-ratings.js  # Script tiện ích để tính toán lại xếp hạng trung bình.
    │
    ├── index.js  # Điểm khởi chạy chính của server Backend.
    ├── package.json  # Khai báo dependencies và scripts cho Backend.
    └── package-lock.json  # Phiên bản chính xác của các gói phụ thuộc.
└── vlu-library-frontend/
    └── src/
        ├── api/
        │   ├── auth.api.js  # Các gọi API liên quan đến xác thực.
        │   ├── axiosConfig.js  # Cấu hình Axios instance và interceptors.
        │   ├── categories.api.js  # Gọi API danh mục.
        │   ├── comments.api.js  # Gọi API bình luận.
        │   ├── dashboard.api.js  # Gọi API thống kê dashboard.
        │   ├── documents.api.js  # Gọi API tài liệu.
        │   ├── reviews.api.js  # Gọi API đánh giá.
        │   └── user.api.js  # Gọi API người dùng.
        │
        ├── components/
        │   ├── admin/
        │   │   ├── ActionCard.jsx  # Thẻ hiển thị hành động nhanh trong admin.
        │   │   ├── AdminDocumentTable.jsx  # Bảng quản lý tài liệu cho Admin.
        │   │   ├── AdminSidebar.jsx  # Thanh bên điều hướng trang Admin.
        │   │   ├── ApproveDialog.jsx  # Hộp thoại duyệt tài liệu/yêu cầu.
        │   │   ├── CannotDeleteDialog.jsx  # Thông báo không thể xóa.
        │   │   ├── CategoryCard.jsx  # Thẻ hiển thị thông tin danh mục.
        │   │   ├── CategoryDialog.jsx  # Hộp thoại thêm/sửa danh mục.
        │   │   ├── ChangeRoleDialog.jsx  # Hộp thoại thay đổi vai trò người dùng.
        │   │   ├── DeleteCategoryDialog.jsx  # Xác nhận xóa danh mục.
        │   │   ├── DeleteDocumentDialog.jsx  # Xác nhận xóa tài liệu (Admin).
        │   │   ├── LockUserDialog.jsx  # Khóa/Mở khóa tài khoản người dùng.
        │   │   ├── ModerationRow.jsx  # Dòng hiển thị trong bảng kiểm duyệt.
        │   │   ├── ModerationTable.jsx  # Bảng danh sách tài liệu chờ duyệt.
        │   │   ├── RejectDialog.jsx  # Hộp thoại từ chối duyệt kèm lý do.
        │   │   ├── ReviewPanel.jsx  # Panel duyệt chi tiết.
        │   │   ├── ReviewRequestDialog.jsx  # Xem xét yêu cầu nâng cấp quyền.
        │   │   ├── StatCard.jsx  # Thẻ hiển thị số liệu thống kê dashboard.
        │   │   └── UserTable.jsx  # Bảng quản lý người dùng.
        │   │
        │   ├── comments/
        │   │   ├── CommentForm.jsx  # Form nhập bình luận.
        │   │   ├── CommentItem.jsx  # Hiển thị một bình luận đơn lẻ.
        │   │   ├── CommentSection.jsx  # Container chứa danh sách và form bình luận.
        │   │   ├── DeleteCommentDialog.jsx  # Xác nhận xóa bình luận.
        │   │   ├── EditCommentDialog.jsx  # Form chỉnh sửa bình luận.
        │   │   └── ReplyForm.jsx
        │   │
        │   ├── common/
        │   │   ├── file-viewer/
        │   │   │   ├── EpubViewer.jsx  # Component hiển thị tệp EPUB.
        │   │   │   ├── FileViewer.jsx  # Wrapper component quyết định trình xem PDF/EPUB.
        │   │   │   ├── index.js  # Export modules cho file-viewer.
        │   │   │   └── PDFViewer.jsx  # Component hiển thị tệp PDF.
        │   │   ├── Header.jsx  # Thanh điều hướng đầu trang (Navbar).
        │   │   ├── LoginRequiredDialog.jsx  # Nhắc nhở đăng nhập khi thực hiện hành động.
        │   │   └── MicrosoftLoginButton.jsx  # Nút đăng nhập SSO Microsoft (Placeholder).
        │   │
        │   ├── documents/
        │   │   ├── DocumentCard.jsx  # Card hiển thị tóm tắt tài liệu dạng lưới.
        │   │   ├── DocumentInfo.jsx  # Hiển thị chi tiết metadata của tài liệu.
        │   │   ├── DocumentListItem.jsx  # Hiển thị tóm tắt tài liệu dạng danh sách.
        │   │   ├── DownloadDialog.jsx  # Hộp thoại xác nhận tải xuống.
        │   │   ├── RelatedDocuments.jsx  # Danh sách tài liệu liên quan.
        │   │   ├── SearchSidebar.jsx  # Thanh lọc và tìm kiếm nâng cao.
        │   │   └── UploadDocumentDialog.jsx  # Modal tải lên tài liệu mới.
        │   │
        │   ├── reviews/
        │   │   ├── DeleteReviewDialog.jsx  # Xác nhận xóa đánh giá.
        │   │   ├── EditReviewDialog.jsx  # Chỉnh sửa đánh giá đã gửi.
        │   │   ├── RatingSummary.jsx  # Hiển thị tổng quan điểm số sao.
        │   │   ├── ReviewForm.jsx  # Form gửi đánh giá và xếp hạng.
        │   │   ├── ReviewList.jsx  # Danh sách các đánh giá của người dùng.
        │   │   └── ReviewSection.jsx  # Container quản lý phần đánh giá.
        │   │
        │   └── user/
        │       ├── RequestAuthorDialog.jsx  # Form gửi yêu cầu trở thành tác giả.
        │       └── UserSidebar.jsx  # Menu bên trang hồ sơ người dùng.
        │
        ├── config/
        │   └── authConfig.js  # Cấu hình liên quan đến xác thực.
        │
        ├── context/
        │   └── AuthContext.jsx  # Context Provider quản lý trạng thái đăng nhập toàn cục.
        │
        ├── hooks/
        │   └── useDownload.js  # Custom hook xử lý logic tải file.
        │
        ├── pages/
        │   ├── admin/
        │   │   ├── CategoriesManagementPage.jsx  # Trang quản lý danh mục.
        │   │   ├── DashboardPage.jsx  # Trang tổng quan thống kê Admin.
        │   │   ├── DocumentsManagementPage.jsx  # Trang quản lý tất cả tài liệu.
        │   │   ├── ModerationPage.jsx  # Trang duyệt tài liệu mới tải lên.
        │   │   ├── ReviewDocumentPage.jsx  # Trang xem xét chi tiết tài liệu để duyệt.
        │   │   ├── UpgradeRequestsPage.jsx  # Trang xử lý yêu cầu nâng cấp quyền.
        │   │   └── UsersManagementPage.jsx  # Trang quản lý danh sách người dùng.
        │   │
        │   ├── auth/
        │   │   ├── LoginPage.jsx  # Trang đăng nhập.
        │   │   └── RegisterPage.jsx  # Trang đăng ký tài khoản.
        │   │
        │   ├── author/
        │   │   └── MyDocumentsPage.jsx  # Trang quản lý tài liệu của tác giả.
        │   │
        │   ├── moderator/
        │   │   ├── ModeratorModerationPage.jsx  # Trang danh sách duyệt dành cho Moderator.
        │   │   └── ModeratorReviewDocumentPage.jsx  # Trang xem xét chi tiết dành cho Moderator.
        │   │
        │   ├── public/
        │   │   ├── DocumentDetailPage.jsx  # Trang chi tiết xem tài liệu (Public).
        │   │   └── SearchPage.jsx  # Trang tìm kiếm và lọc tài liệu.
        │   │
        │   └── user/
        │       ├── ChangePasswordPage.jsx  # Trang đổi mật khẩu.
        │       └── ProfilePage.jsx  # Trang thông tin hồ sơ cá nhân.
        │
        ├── routes/
        │   └── AppRoutes.jsx  # Định nghĩa tất cả các Route và bảo vệ Route.
        │
        ├── theme/
        │   └── theme.js  # Cấu hình theme MUI (màu sắc, font).
        │
        ├── utils/
        │   └── slugify.js  # Hàm tiện ích tạo slug từ chuỗi.
        │
        ├── App.js  # Component gốc của ứng dụng React.
        ├── index.css  # Styles CSS toàn cục.
        └── index.js  # Entry point render React DOM.
