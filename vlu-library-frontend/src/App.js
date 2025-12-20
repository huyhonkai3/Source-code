import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import theme from "./theme/theme";

/**
 * Main App Component
 *
 * Setup:
 * - ThemeProvider: Cung cấp MUI theme cho toàn bộ ứng dụng
 * - CssBaseline: Reset CSS và cung cấp baseline styles
 * - BrowserRouter: Routing
 * - AuthProvider: Global authentication state
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
