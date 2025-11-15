import React from "react";

const Logo = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Logo Container */}
      <div className="bg-gradient-to-br from-red-700 to-red-800 p-4 rounded-xl shadow-lg mb-2">
        <svg
          width="80"
          height="50"
          viewBox="0 0 80 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          {/* Book Icon */}
          <path
            d="M10 8C10 6.89543 10.8954 6 12 6H35C36.1046 6 37 6.89543 37 8V42C37 43.1046 36.1046 44 35 44H12C10.8954 44 10 43.1046 10 42V8Z"
            fill="currentColor"
            opacity="0.8"
          />
          <path
            d="M37 8C37 6.89543 37.8954 6 39 6H68C69.1046 6 70 6.89543 70 8V42C70 43.1046 69.1046 44 68 44H39C37.8954 44 37 43.1046 37 42V8Z"
            fill="currentColor"
            opacity="0.9"
          />
          <path
            d="M37 25C37 24.4477 37.4477 24 38 24H41C41.5523 24 42 24.4477 42 25V44H37V25Z"
            fill="currentColor"
          />
          {/* Lines on book pages */}
          <line
            x1="15"
            y1="15"
            x2="32"
            y2="15"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="15"
            y1="20"
            x2="32"
            y2="20"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="15"
            y1="25"
            x2="27"
            y2="25"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />

          <line
            x1="45"
            y1="15"
            x2="65"
            y2="15"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="45"
            y1="20"
            x2="65"
            y2="20"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />
          <line
            x1="45"
            y1="25"
            x2="60"
            y2="25"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* VLU Text */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-700">VLU</h1>
        <p className="text-xs text-gray-600 font-medium tracking-wide">
          DIGITAL LIBRARY
        </p>
      </div>
    </div>
  );
};

export default Logo;
