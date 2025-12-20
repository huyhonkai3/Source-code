import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
  MenuItem,
  LinearProgress,
  Alert,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";

/**
 * UploadDocumentDialog Component
 * Dialog cho phép Author tải lên tài liệu mới (PDF)
 * Có hỗ trợ Progress Bar và Success View
 *
 * @param {boolean} open - Trạng thái mở dialog
 * @param {Function} onClose - Hàm đóng dialog
 * @param {Function} onSuccess - Callback khi upload thành công (để refresh list)
 */
const UploadDocumentDialog = ({ open, onClose, onSuccess }) => {
  const theme = useTheme();

  // --- STATES ---

  // File & Drag state
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    publishYear: new Date().getFullYear(),
    description: "",
    author: "",
    publisher: "",
  });

  // Data từ API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Upload Logic State
  // status: 'idle' | 'uploading' | 'success' | 'error'
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // --- EFFECTS ---

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      resetForm();
      fetchCategories();
    }
  }, [open]);

  // Tự động điền title bằng tên file (bỏ đuôi .pdf) nếu title đang trống
  useEffect(() => {
    if (file && !formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  }, [file]);

  // --- API CALLS ---

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      const cats = response.data?.categories || response.data || [];
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // --- HANDLERS ---

  const resetForm = () => {
    setFile(null);
    setFormData({
      title: "",
      categoryId: "",
      publishYear: new Date().getFullYear(),
      description: "",
      author: "",
      publisher: "",
    });
    setUploadStatus("idle");
    setProgress(0);
    setError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý kéo thả file
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;

    // 1. Check type PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Chỉ chấp nhận định dạng file PDF.");
      return false;
    }

    // 2. Check size (50MB = 52428800 bytes)
    const maxSize = 50 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("Kích thước file quá lớn (Giới hạn 50MB).");
      return false;
    }

    setError("");
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setFile(null); // Reset file if invalid
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setFile(null);
        e.target.value = ""; // Clear input to allow re-selecting same bad file
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById("file-upload-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    // Validate Form
    if (!file) {
      setError("Vui lòng chọn file tài liệu.");
      return;
    }
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tên tài liệu.");
      return;
    }
    if (!formData.categoryId) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    setUploadStatus("uploading");
    setProgress(0);
    setError("");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("title", formData.title.trim());
      data.append("category", formData.categoryId); // Backend dùng 'category'
      data.append("description", formData.description.trim());
      data.append("publishYear", formData.publishYear);
      if (formData.author) data.append("author", formData.author);
      if (formData.publisher) data.append("publisher", formData.publisher);

      // Gọi API với callback onProgress
      await documentsAPI.upload(data, (percentCompleted) => {
        setProgress(percentCompleted);
      });

      // Thành công
      setUploadStatus("success");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Upload error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Có lỗi xảy ra khi tải lên. Vui lòng thử lại.";
      setError(msg);
      setUploadStatus("idle"); // Quay về idle để user sửa lỗi và thử lại
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isUploading = uploadStatus === "uploading";
  const isSuccess = uploadStatus === "success";

  return (
    <Dialog
      open={open}
      onClose={!isUploading ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "500px",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
          borderBottom: isSuccess ? "none" : undefined,
        }}
      >
        {!isSuccess && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CloudUploadIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Tải lên tài liệu mới
            </Typography>
          </Box>
        )}
        <IconButton onClick={onClose} disabled={isUploading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers={!isSuccess}>
        {isSuccess ? (
          /* SUCCESS VIEW */
          <Fade in={true}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 6,
                textAlign: "center",
              }}
            >
              <CheckCircleIcon
                sx={{ fontSize: 100, color: "success.main", mb: 2 }}
              />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Tải lên thành công!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Tài liệu của bạn đã được gửi và đang chờ kiểm duyệt.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  color="inherit"
                  sx={{ minWidth: 120 }}
                >
                  Đóng
                </Button>
                <Button
                  variant="contained"
                  onClick={resetForm}
                  color="primary"
                  sx={{ minWidth: 180 }}
                >
                  Tải thêm tài liệu
                </Button>
              </Box>
            </Box>
          </Fade>
        ) : (
          /* UPLOAD FORM */
          <>
            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                icon={<ErrorIcon fontSize="inherit" />}
              >
                {error}
              </Alert>
            )}

            {/* Dropzone Area */}
            {!file ? (
              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.grey[400]}`,
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  backgroundColor: dragActive
                    ? alpha(theme.palette.primary.main, 0.05)
                    : theme.palette.background.default,
                  transition: "all 0.2s ease-in-out",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  mb: 3,
                  opacity: isUploading ? 0.6 : 1,
                  "&:hover": !isUploading
                    ? {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.02,
                        ),
                      }
                    : {},
                }}
                onClick={() =>
                  !isUploading &&
                  document.getElementById("file-upload-input").click()
                }
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <CloudUploadIcon
                  sx={{
                    fontSize: 64,
                    color: dragActive
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    mb: 2,
                  }}
                />
                <Typography variant="h6" color="text.primary" gutterBottom>
                  Kéo thả tệp PDF vào đây hoặc nhấn để chọn
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Chỉ chấp nhận định dạng PDF. Kích thước tối đa 50MB.
                </Typography>
              </Box>
            ) : (
              /* File Preview */
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  mb: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.05),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FileIcon color="error" fontSize="large" />
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatFileSize(file.size)}
                    </Typography>
                  </Box>
                </Box>
                {!isUploading && (
                  <IconButton
                    onClick={handleRemoveFile}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )}

            {/* Metadata Form */}
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2 }}>
              THÔNG TIN CHI TIẾT
            </Typography>

            <Grid container spacing={2}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  label="Tên tài liệu *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={isUploading}
                  placeholder="Ví dụ: Giáo trình lập trình Web nâng cao"
                />
              </Grid>

              {/* Author */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tác giả *"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  placeholder="Nhập tên tác giả gốc"
                />
              </Grid>

              {/* Publisher */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Ngôn ngữ *"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                />
              </Grid>

              {/* Category */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Danh mục *"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={isUploading || categoriesLoading}
                >
                  {categoriesLoading ? (
                    <MenuItem disabled>Đang tải danh mục...</MenuItem>
                  ) : categories.length > 0 ? (
                    categories.map((cat) => (
                      <MenuItem
                        key={cat.id || cat._id}
                        value={cat.id || cat._id}
                      >
                        {cat.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Không có danh mục nào</MenuItem>
                  )}
                </TextField>
              </Grid>

              {/* Publish Year */}
              <Grid item xs={12} md={6}>
                <TextField
                  type="number"
                  label="Năm xuất bản *"
                  name="publishYear"
                  value={formData.publishYear}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  label="Mô tả/Tóm tắt"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={isUploading}
                  placeholder="Giới thiệu tóm tắt về tài liệu..."
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      {/* Actions (Only visible if not success) */}
      {!isSuccess && (
        <DialogActions sx={{ p: 3, pt: 1, display: "block" }}>
          {isUploading ? (
            /* Progress Bar Mode */
            <Box sx={{ width: "100%", mt: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="body2" color="primary" fontWeight="bold">
                  Đang tải lên...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ) : (
            /* Buttons Mode */
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                mt: 1,
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                color="inherit"
                sx={{ minWidth: 100 }}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<CloudUploadIcon />}
                sx={{
                  minWidth: 150,
                  bgcolor: theme.palette.primary.light,
                  "&:hover": {
                    bgcolor: theme.palette.primary.main,
                  },
                }}
              >
                Tải lên ngay
              </Button>
            </Box>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default UploadDocumentDialog;
