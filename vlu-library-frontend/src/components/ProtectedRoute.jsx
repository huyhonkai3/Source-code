import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ProtectedRoute Component
 * Bảo vệ routes yêu cầu authentication và authorization
 * 
 * Props:
 * - requiredRole: Role cần thiết để access route (optional)
 * - children: Component con (optional, dùng Outlet nếu không có)
 * 
 * Usage:
 * <Route path="/admin" element={<ProtectedRoute requiredRole="Admin" />}>
 *   <Route element={<AdminLayout />}>
 *     <Route path="categories" element={<CategoryManagerPage />} />
 *   </Route>
 * </Route>
 */
const ProtectedRoute = ({ requiredRole, children }) => {
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const user = useSelector((state) => state.auth.user);

    // Check 1: User phải đăng nhập
    if (!isAuthenticated) {
        // Redirect về login với returnUrl
        return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
    }

    // Check 2: Nếu có yêu cầu role cụ thể
    if (requiredRole) {
        // Admin có quyền truy cập tất cả
        if (user?.role === 'Admin') {
            return children || <Outlet />;
        }

        // Kiểm tra role của user
        if (user?.role !== requiredRole) {
            // Redirect về unauthorized page
            return <Navigate to="/unauthorized" replace />;
        }
    }

    // Pass: Render children hoặc Outlet
    return children || <Outlet />;
};

export default ProtectedRoute;