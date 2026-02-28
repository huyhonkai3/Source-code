/**
 * AdminDirectEditDialog.jsx
 * Dialog cho Admin sửa trực tiếp tài liệu (bỏ qua ràng buộc status).
 * Có Safeguard: Admin phải gõ "XAC NHAN SUA" để mở khóa nút Lưu.
 *
 * Đường dẫn: src/components/admin/AdminDirectEditDialog.jsx
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  alpha,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  AdminPanelSettings as AdminIcon,
  Warning as WarningIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Shield as ShieldIcon,
} from "@mui/icons-material";
import categoriesAPI from "../../api/categories.api";
import documentsAPI from "../../api/documents.api";

const SAFEGUARD_PHRASE = "XAC NHAN SUA";

const AdminDirectEditDialog = ({ open, onClose, document, onSuccess }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    author: "",
    englishTitle: "",
    isbn: "",
    publisher: "",
    publishYear: "",
    category: "",
    language: "Tiếng Việt",
  });

  const [safeguardInput, setSafeguardInput] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const safeguardConfirmed = safeguardInput === SAFEGUARD_PHRASE;
  const isUnlocked = safeguardConfirmed;

  useEffect(() => {
    if (open && document) {
      setForm({
        title: document.title || "",
        description: document.description || "",
        author: document.author || "",
        englishTitle: document.englishTitle || "",
        isbn: document.isbn || "",
        publisher: document.publisher || "",
        publishYear: document.publishYear ? String(document.publishYear) : "",
        category: document.category?.id || document.categoryId || "",
        language: document.documentLanguage || "Tiếng Việt",
      });
      setSafeguardInput("");
      setError("");
      fetchCategories();
    }
  }, [open, document]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data?.categories || response.data || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleClose = () => {
    if (loading) return;
    setSafeguardInput("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!safeguardConfirmed) return;

    setLoading(true);
    setError("");

    try {
      const docId = document?.id || document?._id;
      await documentsAPI.adminDirectEdit(docId, {
        ...form,
        publishYear: form.publishYear ? parseInt(form.publishYear) : undefined,
        safeguardConfirmed: true,
      });
      onSuccess?.();
      handleClose();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Không thể cập nhật. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      fontSize: "0.9375rem",
      bgcolor: isUnlocked ? "white" : "#FAFAFA",
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#7C4DFF",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#7C4DFF" },
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "24px",
          boxShadow: "0 24px 60px rgba(26,26,46,0.25)",
          overflow: "hidden",
          maxHeight: "90vh",
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            pt: 3,
            pb: 2,
            background: "linear-gradient(135deg, #7C4DFF 0%, #311B92 100%)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AdminIcon sx={{ color: "white", fontSize: 26 }} />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{ fontWeight: 700, color: "white", fontSize: "1.125rem" }}
                >
                  Sửa trực tiếp (Admin)
                </Typography>
                <Chip
                  label="PRIVILEGED"
                  size="small"
                  sx={{
                    height: 20,
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.625rem",
                    letterSpacing: "0.05em",
                  }}
                />
              </Box>
              <Typography
                sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.8125rem" }}
              >
                {document?.title}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "auto" }}>
        {/* Safeguard Zone */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: isUnlocked
              ? alpha("#4CAF50", 0.05)
              : alpha("#FF9800", 0.05),
            borderBottom: `2px solid ${isUnlocked ? alpha("#4CAF50", 0.3) : alpha("#FF9800", 0.3)}`,
            transition: "all 0.3s ease",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                bgcolor: isUnlocked
                  ? alpha("#4CAF50", 0.15)
                  : alpha("#FF9800", 0.15),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                mt: 0.5,
                transition: "all 0.3s ease",
              }}
            >
              {isUnlocked ? (
                <LockOpenIcon sx={{ color: "#4CAF50", fontSize: 22 }} />
              ) : (
                <LockIcon sx={{ color: "#FF9800", fontSize: 22 }} />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}
              >
                <ShieldIcon
                  sx={{
                    fontSize: 16,
                    color: isUnlocked ? "#4CAF50" : "#FF9800",
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: isUnlocked ? "#2E7D32" : "#E65100",
                    fontSize: "0.9375rem",
                  }}
                >
                  {isUnlocked
                    ? "✅ Đã xác nhận — Form đã mở khóa"
                    : "🔒 Xác nhận Safeguard để tiếp tục"}
                </Typography>
              </Box>
              <Typography
                sx={{ color: "#6B7280", fontSize: "0.8125rem", mb: 1.5 }}
              >
                {isUnlocked
                  ? "Bạn đã xác nhận. Hãy chỉnh sửa cẩn thận và nhấn Lưu khi hoàn tất."
                  : `Đây là thao tác đặc quyền. Gõ chính xác "${SAFEGUARD_PHRASE}" vào ô bên dưới để mở khóa form chỉnh sửa.`}
              </Typography>
              <TextField
                size="small"
                placeholder={`Gõ "${SAFEGUARD_PHRASE}" để mở khóa`}
                value={safeguardInput}
                onChange={(e) =>
                  setSafeguardInput(e.target.value.toUpperCase())
                }
                InputProps={{
                  style: {
                    fontFamily: "monospace",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    fontSize: "0.9375rem",
                    color: isUnlocked ? "#2E7D32" : "#1A1A2E",
                  },
                }}
                sx={{
                  maxWidth: 280,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    bgcolor: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: isUnlocked
                        ? "#4CAF50"
                        : safeguardInput.length > 0
                          ? "#FF5722"
                          : "#E0E0E0",
                      borderWidth: isUnlocked ? 2 : 1,
                    },
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Form */}
        <Box sx={{ px: 3, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px" }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề tài liệu *"
                value={form.title}
                onChange={handleChange("title")}
                disabled={!isUnlocked}
                sx={inputSx}
              />
            </Grid>

            {/* Author & English Title */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tên tác giả"
                value={form.author}
                onChange={handleChange("author")}
                disabled={!isUnlocked}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tiêu đề tiếng Anh"
                value={form.englishTitle}
                onChange={handleChange("englishTitle")}
                disabled={!isUnlocked}
                sx={inputSx}
              />
            </Grid>

            {/* Publisher & Year */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nhà xuất bản"
                value={form.publisher}
                onChange={handleChange("publisher")}
                disabled={!isUnlocked}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Năm xuất bản"
                type="number"
                value={form.publishYear}
                onChange={handleChange("publishYear")}
                disabled={!isUnlocked}
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                sx={inputSx}
              />
            </Grid>

            {/* ISBN & Language */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={form.isbn}
                onChange={handleChange("isbn")}
                disabled={!isUnlocked}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Ngôn ngữ</InputLabel>
                <Select
                  value={form.language}
                  onChange={handleChange("language")}
                  label="Ngôn ngữ"
                  disabled={!isUnlocked}
                >
                  <MenuItem value="Tiếng Việt">Tiếng Việt</MenuItem>
                  <MenuItem value="Tiếng Anh">Tiếng Anh</MenuItem>
                  <MenuItem value="Tiếng Pháp">Tiếng Pháp</MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Category */}
            <Grid item xs={12}>
              <FormControl fullWidth sx={inputSx}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={form.category}
                  onChange={handleChange("category")}
                  label="Danh mục"
                  disabled={!isUnlocked}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={form.description}
                onChange={handleChange("description")}
                disabled={!isUnlocked}
                sx={inputSx}
              />
            </Grid>
          </Grid>

          {/* Warning */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: "12px",
              bgcolor: alpha("#D32F2F", 0.05),
              border: `1px solid ${alpha("#D32F2F", 0.15)}`,
              display: "flex",
              gap: 1.5,
            }}
          >
            <WarningIcon
              sx={{ color: "#D32F2F", fontSize: 20, flexShrink: 0, mt: 0.2 }}
            />
            <Typography
              sx={{ color: "#B71C1C", fontSize: "0.8125rem", lineHeight: 1.6 }}
            >
              <strong>Cảnh báo:</strong> Thao tác này sẽ cập nhật trực tiếp nội
              dung tài liệu <strong>mà không thay đổi trạng thái</strong>{" "}
              (Approved vẫn là Approved). Chỉ sử dụng để sửa thông tin metadata
              bị sai, không dùng để thay thế file.
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          startIcon={<CloseIcon />}
          sx={{
            color: "#4A4A68",
            borderRadius: "14px",
            px: 3,
            py: 1.25,
            fontWeight: 600,
            fontSize: "0.9375rem",
            textTransform: "none",
            border: "1px solid #E0E0E0",
            "&:hover": { bgcolor: "#F5F5F5" },
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isUnlocked || loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            background: isUnlocked
              ? "linear-gradient(135deg, #7C4DFF 0%, #311B92 100%)"
              : undefined,
            borderRadius: "14px",
            px: 4,
            py: 1.25,
            fontWeight: 700,
            fontSize: "0.9375rem",
            textTransform: "none",
            boxShadow: isUnlocked
              ? "0 6px 20px rgba(124,77,255,0.4)"
              : undefined,
            "&:hover": {
              background: isUnlocked
                ? "linear-gradient(135deg, #651FFF 0%, #1A0072 100%)"
                : undefined,
            },
            transition: "all 0.3s ease",
          }}
        >
          {loading ? "Đang lưu..." : "🔐 Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminDirectEditDialog;
