// Cập nhật routing để bao gồm PublicLayout và các trang mới

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Layouts
import AuthLayout from "./components/AuthLayout";
import MainLayout from "./components/MainLayout";
import PublicLayout from "./components/PublicLayout"; // MỚI - Ngày 4

// Auth Pages
import Register from "./pages/RegisterPage";
import Login from "./pages/LoginPage";

// Admin Pages
import Categories from "./pages/admin/CategoryManagerPage";

// Moderator Pages
import ReviewDocuments from "./pages/moderator/DocumentReviewPage"; // MỚI - Ngày 4

// Author Pages
import UploadDocument from "./pages/author/DocumentUploadPage";

// Public Pages
import HomePage from "./pages/public/HomePage"; // MỚI - Ngày 4

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userRole = useSelector((state) => state.auth.user?.role);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== PUBLIC ROUTES (PublicLayout) ==================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          {/* Route chi tiết tài liệu sẽ được thêm vào Ngày 5 */}
          {/* <Route path="/documents/:id" element={<DocumentDetail />} /> */}
        </Route>

        {/* ==================== AUTH ROUTES (AuthLayout) ==================== */}
        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* ==================== ADMIN ROUTES (MainLayout) ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/categories" element={<Categories />} />
          {/* Các route Admin khác sẽ được thêm vào sau */}
        </Route>

        {/* ==================== MODERATOR ROUTES (MainLayout) ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Moderator", "Admin"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/moderator/review" element={<ReviewDocuments />} />
        </Route>

        {/* ==================== AUTHOR ROUTES (MainLayout) ==================== */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["Author", "Admin"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/author/upload" element={<UploadDocument />} />
        </Route>

        {/* ==================== FALLBACK ==================== */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
