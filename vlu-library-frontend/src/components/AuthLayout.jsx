import React from "react";

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        {children}
        </div>
    );
};

export default AuthLayout;
