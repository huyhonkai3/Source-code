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
  alpha,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  MenuBook as EpubIcon,
  PictureAsPdf as PdfIcon,
  Description as FileIcon,
  Upload as UploadIcon,
} from "@mui/icons-material";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";

/**
 * Danh sách MIME types và extensions được hỗ trợ
 */
const SUPPORTED_FORMATS = {
  "application/pdf": {
    extension: ".pdf",
    label: "PDF",
    color: "#D32F2F",
  },
  "application/epub+zip": {
    extension: ".epub",
    label: "EPUB",
    color: "#FF7043",
  },
};

const ACCEPTED_EXTENSIONS = ".pdf,.epub";
const ACCEPTED_MIME_TYPES = Object.keys(SUPPORTED_FORMATS);
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * UploadDocumentDialog Component - VLU Design System v2.0
 * Modern & Bold dialog cho phép Author tải lên tài liệu mới
 */
const UploadDocumentDialog = ({ open, onClose, onSuccess }) => {
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
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      resetForm();
      fetchCategories();
    }
  }, [open]);

  // Tự động điền title bằng tên file
  useEffect(() => {
    if (file && !formData.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }
  }, [file]);

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

    if (!ACCEPTED_MIME_TYPES.includes(selectedFile.type)) {
      setError("Định dạng file không được hỗ trợ. Chỉ chấp nhận PDF và EPUB.");
      return false;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
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
        setFile(null);
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
        e.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById("file-upload-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
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
      data.append("category", formData.categoryId);
      data.append("description", formData.description.trim());
      data.append("publishYear", formData.publishYear);
      if (formData.author) data.append("author", formData.author);
      if (formData.publisher) data.append("publisher", formData.publisher);

      await documentsAPI.upload(data, (percentCompleted) => {
        setProgress(percentCompleted);
      });

      setUploadStatus("success");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Upload error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Có lỗi xảy ra khi tải lên. Vui lòng thử lại.";
      setError(msg);
      setUploadStatus("idle");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileFormatInfo = () => {
    if (!file) return null;
    return SUPPORTED_FORMATS[file.type] || SUPPORTED_FORMATS["application/pdf"];
  };

  const renderFileIcon = () => {
    if (!file) return <FileIcon sx={{ fontSize: 32, color: "#8E8EA9" }} />;

    if (file.type === "application/epub+zip") {
      return <EpubIcon sx={{ fontSize: 32, color: "#FF7043" }} />;
    }
    return <PdfIcon sx={{ fontSize: 32, color: "#D32F2F" }} />;
  };

  const isUploading = uploadStatus === "uploading";
  const isSuccess = uploadStatus === "success";

  // Common text field styles
  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#FAFAFC",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#C4C4D4",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#D32F2F",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#D32F2F",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={!isUploading ? onClose : undefined}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 24px 48px rgba(26,26,46,0.2)",
          minHeight: "500px",
        },
      }}
    >
      {/* ========== HEADER ========== */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #F0F0F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "12px",
                bgcolor: alpha("#D32F2F", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 24, color: "#D32F2F" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#1A1A2E" }}
              >
                Tải lên tài liệu mới
              </Typography>
              <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
                Hỗ trợ định dạng PDF và EPUB
              </Typography>
            </Box>
          </Box>
          {!isUploading && (
            <IconButton
              onClick={onClose}
              sx={{
                color: "#8E8EA9",
                "&:hover": {
                  bgcolor: "#F0F0F5",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* ========== SUCCESS VIEW ========== */}
        {isSuccess ? (
          <Fade in={isSuccess}>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 3,
                  borderRadius: "50%",
                  bgcolor: alpha("#4CAF50", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "scaleIn 0.3s ease",
                  "@keyframes scaleIn": {
                    from: { transform: "scale(0)" },
                    to: { transform: "scale(1)" },
                  },
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 56, color: "#4CAF50" }} />
              </Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
              >
                Tải lên thành công!
              </Typography>
              <Typography variant="body1" sx={{ color: "#8E8EA9", mb: 4 }}>
                Tài liệu của bạn đã được gửi đi và đang chờ kiểm duyệt.
              </Typography>
              <Button
                variant="contained"
                onClick={onClose}
                sx={{
                  bgcolor: "#4CAF50",
                  color: "white",
                  borderRadius: "12px",
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(76,175,80,0.3)",
                  "&:hover": {
                    bgcolor: "#388E3C",
                  },
                }}
              >
                Đóng
              </Button>
            </Box>
          </Fade>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                icon={<ErrorIcon />}
                onClose={() => setError("")}
                sx={{
                  mb: 3,
                  borderRadius: "12px",
                }}
              >
                {error}
              </Alert>
            )}

            {/* ========== DROPZONE ========== */}
            {!file ? (
              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() =>
                  !isUploading &&
                  document.getElementById("file-upload-input").click()
                }
                sx={{
                  border: "2px dashed",
                  borderColor: dragActive ? "#D32F2F" : "#E0E0E0",
                  borderRadius: "16px",
                  p: 5,
                  textAlign: "center",
                  bgcolor: dragActive ? alpha("#D32F2F", 0.04) : "#FAFAFC",
                  transition: "all 0.2s ease",
                  cursor: isUploading ? "not-allowed" : "pointer",
                  mb: 3,
                  opacity: isUploading ? 0.6 : 1,
                  "&:hover": !isUploading
                    ? {
                        borderColor: "#D32F2F",
                        bgcolor: alpha("#D32F2F", 0.02),
                      }
                    : {},
                }}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  hidden
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />

                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                    borderRadius: "50%",
                    bgcolor: dragActive ? alpha("#D32F2F", 0.1) : "#F0F0F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: 40,
                      color: dragActive ? "#D32F2F" : "#8E8EA9",
                    }}
                  />
                </Box>

                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: "#1A1A2E", mb: 1 }}
                >
                  Kéo thả tệp PDF hoặc EPUB vào đây
                </Typography>
                <Typography variant="body2" sx={{ color: "#8E8EA9", mb: 2 }}>
                  hoặc nhấn để chọn file từ máy tính
                </Typography>

                {/* Supported formats */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 2,
                      py: 0.75,
                      borderRadius: "8px",
                      bgcolor: alpha("#D32F2F", 0.1),
                    }}
                  >
                    <PdfIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#D32F2F" }}
                    >
                      PDF
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      px: 2,
                      py: 0.75,
                      borderRadius: "8px",
                      bgcolor: alpha("#FF7043", 0.1),
                    }}
                  >
                    <EpubIcon sx={{ fontSize: 18, color: "#FF7043" }} />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 600, color: "#FF7043" }}
                    >
                      EPUB
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  sx={{ color: "#C4C4D4", display: "block", mt: 2 }}
                >
                  Kích thước tối đa 50MB
                </Typography>
              </Box>
            ) : (
              /* ========== FILE PREVIEW ========== */
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2.5,
                  mb: 3,
                  borderRadius: "14px",
                  bgcolor: alpha("#4CAF50", 0.08),
                  border: "1px solid",
                  borderColor: alpha("#4CAF50", 0.2),
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      bgcolor: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {renderFileIcon()}
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "#1A1A2E" }}
                    >
                      {file.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
                        {formatFileSize(file.size)}
                      </Typography>
                      <Box
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: "6px",
                          bgcolor:
                            file.type === "application/epub+zip"
                              ? alpha("#FF7043", 0.1)
                              : alpha("#D32F2F", 0.1),
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color:
                              file.type === "application/epub+zip"
                                ? "#FF7043"
                                : "#D32F2F",
                          }}
                        >
                          {getFileFormatInfo()?.label || "PDF"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
                {!isUploading && (
                  <IconButton
                    onClick={handleRemoveFile}
                    sx={{
                      color: "#D32F2F",
                      "&:hover": {
                        bgcolor: alpha("#D32F2F", 0.1),
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            )}

            {/* ========== METADATA FORM ========== */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#1A1A2E",
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Thông tin chi tiết
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
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Author */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Tác giả"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  placeholder="Nhập tên tác giả gốc"
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Publisher */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Ngôn ngữ"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  placeholder="Ví dụ: Tiếng Việt"
                  sx={textFieldStyles}
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
                  sx={textFieldStyles}
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
                  label="Năm xuất bản"
                  name="publishYear"
                  value={formData.publishYear}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                  sx={textFieldStyles}
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
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      {/* ========== ACTIONS ========== */}
      {!isSuccess && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          {isUploading ? (
            /* Progress Bar Mode */
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#D32F2F" }}
                >
                  Đang tải lên...
                </Typography>
                <Typography variant="body2" sx={{ color: "#8E8EA9" }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "#F0F0F5",
                  "& .MuiLinearProgress-bar": {
                    bgcolor: "#D32F2F",
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          ) : (
            /* Buttons Mode */
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                width: "100%",
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderColor: "#E0E0E0",
                  color: "#4A4A68",
                  borderRadius: "12px",
                  px: 3,
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#C4C4D4",
                    bgcolor: "#FAFAFC",
                  },
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<UploadIcon />}
                sx={{
                  bgcolor: "#D32F2F",
                  color: "white",
                  borderRadius: "12px",
                  px: 4,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 4px 14px rgba(211,47,47,0.3)",
                  "&:hover": {
                    bgcolor: "#B71C1C",
                    boxShadow: "0 6px 20px rgba(211,47,47,0.4)",
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
