/**
 * EditDocumentDialog.jsx - VLU Design System v2.0.1
 * Dialog chỉnh sửa metadata tài liệu cho Author
 *
 * Business Rules:
 * - Chỉ cho phép sửa tài liệu có status: 'pending' hoặc 'rejected'
 * - Nếu tài liệu đang 'rejected', sau khi sửa sẽ tự động chuyển về 'pending'
 * - File mới là optional (có thể thay thế file cũ nếu muốn)
 *
 * Đường dẫn: src/components/documents/EditDocumentDialog.jsx
 */

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
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  MenuBook as EpubIcon,
  PictureAsPdf as PdfIcon,
  Description as FileIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
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
 * EditDocumentDialog Component
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close callback
 * @param {function} onSuccess - Success callback (after update)
 * @param {object} document - Document object to edit
 */
const EditDocumentDialog = ({ open, onClose, onSuccess, document }) => {
  // File state (optional - for replacing existing file)
  const [newFile, setNewFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    publishYear: new Date().getFullYear(),
    description: "",
    author: "",
    publisher: "",
    language: "Tiếng Việt",
  });

  // Data từ API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // UI State
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Populate form khi document thay đổi
  useEffect(() => {
    if (open && document) {
      setFormData({
        title: document.title || "",
        categoryId:
          document.category?.id ||
          document.categoryId?._id ||
          document.categoryId ||
          "",
        publishYear: document.publishYear || new Date().getFullYear(),
        description: document.description || "",
        author: document.author || "",
        publisher: document.publisher || "",
        language: document.language || "Tiếng Việt",
      });
      setNewFile(null);
      setError("");
      setSuccess(false);
      fetchCategories();
    }
  }, [open, document]);

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
        setNewFile(droppedFile);
      } else {
        setNewFile(null);
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setNewFile(selectedFile);
      } else {
        setNewFile(null);
        e.target.value = "";
      }
    }
  };

  const handleRemoveNewFile = () => {
    setNewFile(null);
    const fileInput = document.getElementById("edit-file-input");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title.trim()) {
      setError("Vui lòng nhập tên tài liệu.");
      return;
    }
    if (!formData.categoryId) {
      setError("Vui lòng chọn danh mục.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        category: formData.categoryId,
        description: formData.description.trim(),
        publishYear: formData.publishYear,
        author: formData.author?.trim() || null,
        publisher: formData.publisher?.trim() || null,
        language: formData.language,
      };

      // Nếu có file mới, sử dụng FormData
      if (newFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("file", newFile);
        Object.keys(updateData).forEach((key) => {
          if (updateData[key] !== null && updateData[key] !== undefined) {
            formDataToSend.append(key, updateData[key]);
          }
        });
        await documentsAPI.updateDocument(
          document.id || document._id,
          formDataToSend,
        );
      } else {
        // Không có file mới, gửi JSON
        await documentsAPI.updateDocument(
          document.id || document._id,
          updateData,
        );
      }

      setSuccess(true);

      // Delay để hiển thị success message
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileIcon sx={{ fontSize: 32, color: "#8E8EA9" }} />;
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "epub") {
      return <EpubIcon sx={{ fontSize: 32, color: "#FF7043" }} />;
    }
    return <PdfIcon sx={{ fontSize: 32, color: "#D32F2F" }} />;
  };

  const getStatusChip = () => {
    if (!document?.status) return null;

    const configs = {
      pending: {
        label: "Chờ duyệt",
        color: "#FBBF24",
        bgColor: alpha("#FBBF24", 0.15),
      },
      rejected: {
        label: "Bị từ chối",
        color: "#F87171",
        bgColor: alpha("#F87171", 0.15),
      },
      approved: {
        label: "Đã duyệt",
        color: "#34D399",
        bgColor: alpha("#34D399", 0.15),
      },
    };

    const config = configs[document.status] || configs.pending;

    return (
      <Chip
        label={config.label}
        size="small"
        sx={{
          bgcolor: config.bgColor,
          color: config.color,
          fontWeight: 600,
          fontSize: "0.75rem",
        }}
      />
    );
  };

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
      },
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#D32F2F",
    },
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          boxShadow: "0 24px 48px rgba(26,26,46,0.15)",
        },
      }}
    >
      {/* ========== HEADER ========== */}
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
            borderBottom: "1px solid #F0F0F5",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #D32F2F 0%, #FF6B6B 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  fontSize: "1.25rem",
                }}
              >
                Chỉnh sửa tài liệu
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Typography sx={{ color: "#8E8EA9", fontSize: "0.875rem" }}>
                  Cập nhật thông tin
                </Typography>
                {getStatusChip()}
              </Box>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#8E8EA9",
              "&:hover": { bgcolor: "#F0F0F5" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ========== CONTENT ========== */}
      <DialogContent sx={{ p: 3 }}>
        {/* Success State */}
        {success ? (
          <Fade in={success}>
            <Box
              sx={{
                textAlign: "center",
                py: 6,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: alpha("#34D399", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 3,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, color: "#34D399" }} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  fontSize: "1.25rem",
                  mb: 1,
                }}
              >
                Cập nhật thành công!
              </Typography>
              <Typography sx={{ color: "#8E8EA9" }}>
                {document?.status === "rejected"
                  ? "Tài liệu đã được gửi lại để kiểm duyệt."
                  : "Thông tin tài liệu đã được cập nhật."}
              </Typography>
            </Box>
          </Fade>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  mb: 3,
                  borderRadius: "12px",
                  "& .MuiAlert-icon": { color: "#D32F2F" },
                }}
              >
                {error}
              </Alert>
            )}

            {/* Info Alert for rejected documents */}
            {document?.status === "rejected" && (
              <Alert
                severity="info"
                icon={<RefreshIcon />}
                sx={{
                  mb: 3,
                  borderRadius: "12px",
                  bgcolor: alpha("#60A5FA", 0.1),
                  "& .MuiAlert-icon": { color: "#60A5FA" },
                }}
              >
                <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                  Tài liệu bị từ chối
                </Typography>
                <Typography sx={{ fontSize: "0.875rem" }}>
                  Lý do: {document.rejectionReason || "Không có lý do cụ thể"}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.8125rem", color: "#6B7280", mt: 1 }}
                >
                  Sau khi chỉnh sửa, tài liệu sẽ được gửi lại để kiểm duyệt.
                </Typography>
              </Alert>
            )}

            {/* ========== CURRENT FILE INFO ========== */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  mb: 1.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                }}
              >
                File hiện tại
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "#F8F9FA",
                  border: "1px solid #E9ECEF",
                }}
              >
                {getFileIcon(document?.fileName)}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#1A1A2E",
                      fontSize: "0.9375rem",
                    }}
                  >
                    {document?.fileName || "Không có tên file"}
                  </Typography>
                  <Typography sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}>
                    {formatFileSize(document?.fileSize)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* ========== NEW FILE UPLOAD (OPTIONAL) ========== */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#1A1A2E",
                  mb: 1.5,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  fontSize: "0.75rem",
                }}
              >
                Thay thế file (tùy chọn)
              </Typography>

              {!newFile ? (
                <Box
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    border: `2px dashed ${dragActive ? "#D32F2F" : "#E0E0E0"}`,
                    borderRadius: "12px",
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    bgcolor: dragActive ? alpha("#D32F2F", 0.05) : "#FAFAFC",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#D32F2F",
                      bgcolor: alpha("#D32F2F", 0.02),
                    },
                  }}
                  onClick={() =>
                    document.getElementById("edit-file-input")?.click()
                  }
                >
                  <input
                    id="edit-file-input"
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <UploadIcon sx={{ fontSize: 36, color: "#8E8EA9", mb: 1 }} />
                  <Typography sx={{ color: "#4A4A68", fontSize: "0.9375rem" }}>
                    Kéo thả file hoặc click để chọn file mới
                  </Typography>
                  <Typography
                    sx={{ color: "#8E8EA9", fontSize: "0.8125rem", mt: 0.5 }}
                  >
                    PDF, EPUB (Tối đa 50MB)
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: alpha("#34D399", 0.1),
                    border: "1px solid",
                    borderColor: alpha("#34D399", 0.3),
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {getFileIcon(newFile.name)}
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#1A1A2E",
                          fontSize: "0.9375rem",
                        }}
                      >
                        {newFile.name}
                      </Typography>
                      <Typography
                        sx={{ color: "#34D399", fontSize: "0.8125rem" }}
                      >
                        File mới • {formatFileSize(newFile.size)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    onClick={handleRemoveNewFile}
                    disabled={saving}
                    sx={{
                      color: "#D32F2F",
                      "&:hover": { bgcolor: alpha("#D32F2F", 0.1) },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* ========== METADATA FORM ========== */}
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                color: "#1A1A2E",
                mb: 2,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "0.75rem",
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
                  disabled={saving}
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
                  disabled={saving}
                  placeholder="Nhập tên tác giả gốc"
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Publisher */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Nhà xuất bản"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={saving}
                  placeholder="Ví dụ: NXB Giáo dục, NXB Trẻ..."
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Language */}
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Ngôn ngữ"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={saving}
                  sx={textFieldStyles}
                >
                  <MenuItem value="Tiếng Việt">Tiếng Việt</MenuItem>
                  <MenuItem value="Tiếng Anh">Tiếng Anh</MenuItem>
                  <MenuItem value="Tiếng Nhật">Tiếng Nhật</MenuItem>
                  <MenuItem value="Tiếng Trung">Tiếng Trung</MenuItem>
                  <MenuItem value="Tiếng Hàn">Tiếng Hàn</MenuItem>
                  <MenuItem value="Tiếng Pháp">Tiếng Pháp</MenuItem>
                  <MenuItem value="Song ngữ Việt-Anh">
                    Song ngữ Việt-Anh
                  </MenuItem>
                  <MenuItem value="Khác">Khác</MenuItem>
                </TextField>
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
                  disabled={saving || categoriesLoading}
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
                  disabled={saving}
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
                  disabled={saving}
                  placeholder="Giới thiệu tóm tắt về tài liệu..."
                  sx={textFieldStyles}
                />
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>

      {/* ========== ACTIONS ========== */}
      {!success && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          {saving ? (
            <Box sx={{ width: "100%" }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "#D32F2F" }}
                >
                  Đang lưu thay đổi...
                </Typography>
              </Box>
              <LinearProgress
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
                startIcon={<SaveIcon />}
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
                Lưu thay đổi
              </Button>
            </Box>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default EditDocumentDialog;
