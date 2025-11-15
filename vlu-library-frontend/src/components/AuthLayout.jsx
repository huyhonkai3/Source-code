import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

/**
 * AuthLayout - Layout wrapper cho trang đăng ký và đăng nhập
 * Chỉ cần render <Outlet /> vì các page tự handle layout riêng
 */
const AuthLayout = () => {
    return (
        <Box>
            <Outlet />
        </Box>
    );
};

export default AuthLayout;