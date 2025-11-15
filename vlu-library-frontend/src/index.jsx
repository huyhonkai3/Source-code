// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import App from "./App";
import VluTheme from "./theme/VluTheme";
import {createAppStore} from "./store/store";
import "./index.css"; // Tailwind CSS entry

// Hàm khởi tạo preloadedState từ localStorage
const loadPreloadedState = () => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const userRaw = localStorage.getItem("user");

    if (!accessToken) {
      return undefined;
    }

    let user = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw);
      } catch {
        user = null;
      }
    }

    return {
      auth: {
        user,
        accessToken,
        refreshToken: refreshToken || null,
        isAuthenticated: !!accessToken,
      },
    };
  } catch {
    return undefined;
  }
};

const preloadedState = loadPreloadedState();
const store = createAppStore(preloadedState);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={VluTheme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
