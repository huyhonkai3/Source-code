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
import ModeratorModerationPage from "../pages/moderator/ModeratorModerationPage";
import ModeratorReviewDocumentPage from "../pages/moderator/ModeratorReviewDocumentPage";
import LandingPage from "../pages/public/LandingPage";
import CategoriesPage from "../pages/public/CategoriesPage";
import AuthorStatsPage from "../pages/author/AuthorStatsPage";
import NotificationsPage from "../pages/user/NotificationsPage";
import RequestsManagementPage from "../pages/admin/RequestsManagementPage";
import ReportsManagementPage from "../pages/admin/ReportsManagementPage";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading)
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
  if (!isAuthenticated) {
    localStorage.setItem("redirectPath", window.location.pathname);
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading)
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
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading)
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
  if (!isAuthenticated) {
    localStorage.setItem("redirectPath", window.location.pathname);
    return <Navigate to="/login" replace />;
  }
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

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Auth ── */}
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

      {/* ── Public ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/documents" element={<SearchPage />} />
      <Route path="/documents/:id" element={<DocumentDetailPage />} />
      <Route path="/categories" element={<CategoriesPage />} />

      {/* ── User (Protected) ── */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />

      {/* ── Author ── */}
      <Route
        path="/my-documents"
        element={
          <RoleBasedRoute allowedRoles={["Author", "Admin"]}>
            <MyDocumentsPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/author/stats"
        element={
          <RoleBasedRoute allowedRoles={["Author", "Admin"]}>
            <AuthorStatsPage />
          </RoleBasedRoute>
        }
      />

      {/* ── Moderator ── */}
      <Route
        path="/moderation"
        element={
          <RoleBasedRoute allowedRoles={["Moderator"]}>
            <ModeratorModerationPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/moderation/:id"
        element={
          <RoleBasedRoute allowedRoles={["Moderator"]}>
            <ReviewDocumentPage />
          </RoleBasedRoute>
        }
      />

      {/* ── Admin ── */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <DashboardPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/moderation"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <ModerationPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/moderation/:id"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <ReviewDocumentPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <CategoriesManagementPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/documents"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <DocumentsManagementPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <UsersManagementPage />
          </RoleBasedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <ReportsManagementPage />
          </RoleBasedRoute>
        }
      />

      {/*
        FIX: /admin/requests → RequestsManagementPage (trang mới, 2 tab)
        Đổi từ ProtectedRoute → RoleBasedRoute Admin-only cho nhất quán
      */}
      <Route
        path="/admin/requests"
        element={
          <RoleBasedRoute allowedRoles={["Admin"]}>
            <RequestsManagementPage />
          </RoleBasedRoute>
        }
      />

      {/*
        FIX: /admin/upgrade-requests (route cũ, sidebar từng trỏ vào đây)
        → redirect sang /admin/requests để không bị 404 nếu còn bookmark/link cũ
        UpgradeRequestsPage giờ không còn được dùng từ sidebar nữa.
      */}
      <Route
        path="/admin/upgrade-requests"
        element={<Navigate to="/admin/requests" replace />}
      />

      {/* ── 404 ── */}
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
