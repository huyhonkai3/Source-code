import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import SearchPage from "../pages/public/SearchPage";
import ProfilePage from "../pages/user/ProfilePage";
import MyDocumentsPage from "../pages/author/MyDocumentsPage";
import DashboardPage from "../pages/admin/DashboardPage";
import ModerationPage from "../pages/admin/ModerationPage";
import ReviewDocumentPage from "../pages/admin/ReviewDocumentPage";
import CategoriesManagementPage from "../pages/admin/CategoriesManagementPage";
import DocumentsManagementPage from "../pages/admin/DocumentsManagementPage";
import UpgradeRequestsPage from "../pages/admin/UpgradeRequestsPage";
import DocumentDetailPage from "../pages/public/DocumentDetailPage";
import UsersManagementPage from "../pages/admin/UsersManagementPage";
import ChangePasswordPage from "../pages/user/ChangePasswordPage";
// Moderator Pages - Sử dụng UserSidebar
import ModeratorModerationPage from "../pages/moderator/ModeratorModerationPage";
import ModeratorReviewDocumentPage from "../pages/moderator/ModeratorReviewDocumentPage";
import LandingPage from "../pages/public/LandingPage";
import CategoriesPage from "../pages/public/CategoriesPage";
import AuthorStatsPage from "../pages/author/AuthorStatsPage";
import NotificationsPage from "../pages/user/NotificationsPage";
import RequestsManagementPage from "../pages/admin/RequestsManagementPage";
import ReportsManagementPage from "../pages/admin/ReportsManagementPage";

/**
 * ProtectedRoute Component
 * Bảo vệ các routes yêu cầu authentication
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Lưu đường dẫn hiện tại để redirect sau khi login
    localStorage.setItem("redirectPath", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return children;
};

/**
 * PublicRoute Component
 * Chuyển hướng về home nếu đã đăng nhập
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * RoleBasedRoute Component
 * Bảo vệ routes theo role
 * @param {Array} allowedRoles - Danh sách roles được phép truy cập
 */
const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    localStorage.setItem("redirectPath", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h1>403 - Forbidden</h1>
        <p>Bạn không có quyền truy cập trang này</p>
        <a href="/">Quay về trang chủ</a>
      </div>
    );
  }

  return children;
};

/**
 * AppRoutes Component
 * Định nghĩa tất cả routes của ứng dụng
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* ============================================
          PUBLIC ROUTES - Chỉ truy cập khi chưa đăng nhập
          ============================================ */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Categories Page */}
      <Route path="/categories" element={<CategoriesPage />} />

      {/* ============================================
          PROTECTED ROUTES - Yêu cầu đăng nhập
          ============================================ */}

      {/* Landing Page - Public (không cần đăng nhập) */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Document Search Page */}
      <Route path="/documents" element={<SearchPage />} />

      {/* Public Document Detail Page */}
      <Route path="/documents/:id" element={<DocumentDetailPage />} />

      {/* User Profile Page - Protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Change Password Page - Protected */}
      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Route Notifications */}
      <Route
        path="/user/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* ============================================
          AUTHOR ROUTES
          ============================================ */}
      <Route
        path="/my-documents"
        element={
          <RoleBasedRoute allowedRoles={["Author", "Admin"]}>
            <MyDocumentsPage />
          </RoleBasedRoute>
        }
      />

      {/* Author Stats Page */}
      <Route
        path="/author/stats"
        element={
          <RoleBasedRoute allowedRoles={["Author", "Admin"]}>
            <AuthorStatsPage />
          </RoleBasedRoute>
        }
      />

      {/* ============================================
          MODERATOR ROUTES - Sử dụng UserSidebar
          Route riêng cho Moderator, KHÔNG dùng /admin prefix
          ============================================ */}

      {/* Moderator Moderation Page - Danh sách tài liệu cần duyệt */}
      <Route
        path="/moderation"
        element={
          <RoleBasedRoute allowedRoles={["Moderator"]}>
            <ModeratorModerationPage />
          </RoleBasedRoute>
        }
      />

      {/* Moderator Review Document Page - Tái sử dụng ReviewDocumentPage */}
      <Route
        path="/moderation/:id"
        element={
          <RoleBasedRoute allowedRoles={["Moderator"]}>
            <ReviewDocumentPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Dashboard Page - Admin Only */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <DashboardPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Moderation Page - Admin Only (với AdminSidebar) */}
      <Route
        path="/admin/moderation"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <ModerationPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Review Document Page - Admin Only */}
      <Route
        path="/admin/moderation/:id"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <ReviewDocumentPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Categories Management Page - Admin only */}
      <Route
        path="/admin/categories"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <CategoriesManagementPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Documents Management Page - Admin only */}
      <Route
        path="/admin/documents"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <DocumentsManagementPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Upgrade Requests Page - Admin only */}
      <Route
        path="/admin/upgrade-requests"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <UpgradeRequestsPage />
          </RoleBasedRoute>
        }
      />

      {/* Admin Reports Management Page - Admin only */}
      <Route
        path="/admin/reports"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <ReportsManagementPage />
          </RoleBasedRoute>
        }
      />

      <Route
        path="/admin/requests"
        element={
          <ProtectedRoute>
            <RequestsManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Users Management Page - Admin only */}
      <Route
        path="/admin/users"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <UsersManagementPage />
          </RoleBasedRoute>
        }
      />

      {/* ============================================
          404 NOT FOUND
          ============================================ */}
      <Route
        path="*"
        element={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <h1>404 - Page Not Found</h1>
            <a href="/">Back to Home</a>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
