import { createTheme } from "@mui/material/styles";

// VLU red ~ Tailwind bg-red-700 (#b91c1c)
const VluTheme = createTheme({
    palette: {
        mode: "light",
        primary: {
            main: "#b91c1c",
        },
        background: {
            default: "#f3f4f6", // Tailwind bg-gray-100
            paper: "#ffffff",
        },
    },
    typography: {
        fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
});

export default VluTheme;