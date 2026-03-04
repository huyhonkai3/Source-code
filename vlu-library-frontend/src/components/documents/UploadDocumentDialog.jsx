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
  Tooltip,
  Divider,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormHelperText,
  Paper,
  Chip,
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
  InfoOutlined as InfoOutlinedIcon,
  Gavel as GavelIcon,
  AssignmentInd as OwnCreationIcon,
  PublicOutlined as PublicDomainIcon,
  HandshakeOutlined as ThirdPartyIcon,
  AttachFile as AttachFileIcon,
  VerifiedUser as VerifiedIcon,
} from "@mui/icons-material";
import documentsAPI from "../../api/documents.api";
import categoriesAPI from "../../api/categories.api";

// ==================== CONSTANTS ====================

const SUPPORTED_FORMATS = {
  "application/pdf": { extension: ".pdf", label: "PDF", color: "#D32F2F" },
  "application/epub+zip": {
    extension: ".epub",
    label: "EPUB",
    color: "#FF7043",
  },
};

const SUPPORTED_AUTHORIZATION_FORMATS = {
  "application/pdf": { label: "PDF" },
  "image/jpeg": { label: "JPG" },
  "image/png": { label: "PNG" },
};

const ACCEPTED_EXTENSIONS = ".pdf,.epub";
const ACCEPTED_AUTHORIZATION_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";
const ACCEPTED_MIME_TYPES = Object.keys(SUPPORTED_FORMATS);
const ACCEPTED_AUTHORIZATION_MIME_TYPES = Object.keys(
  SUPPORTED_AUTHORIZATION_FORMATS,
);
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_AUTH_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const COPYRIGHT_TYPES = [
  {
    value: "OWN_CREATION",
    label: "Tác phẩm của tôi",
    description: "Tôi là tác giả gốc hoặc đồng tác giả của tài liệu này",
    icon: OwnCreationIcon,
    color: "#4CAF50",
    requiresDeclaration: true,
  },
  {
    value: "PUBLIC_DOMAIN",
    label: "Phạm vi công cộng / Mã nguồn mở",
    description:
      "Tài liệu đã hết hạn bảo hộ bản quyền hoặc được phát hành công khai",
    icon: PublicDomainIcon,
    color: "#2196F3",
    requiresDeclaration: false,
  },
  {
    value: "THIRD_PARTY_AUTHORIZED",
    label: "Được ủy quyền bởi bên thứ 3",
    description: "Tôi có giấy ủy quyền hợp lệ từ chủ sở hữu bản quyền",
    icon: ThirdPartyIcon,
    color: "#FF9800",
    requiresAuthFile: true,
    requiresDeclaration: false,
  },
];

// ==================== COMPONENT ====================

const UploadDocumentDialog = ({ open, onClose, onSuccess }) => {
  // File & Drag state
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // [NEW] Authorization file (giấy ủy quyền)
  const [authorizationFile, setAuthorizationFile] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    publishYear: new Date().getFullYear(),
    description: "",
    author: "",
    publisher: "",
    isbn: "",
    englishTitle: "",
    language: "Tiếng Việt",
  });

  // [NEW] Copyright state
  const [copyrightType, setCopyrightType] = useState("OWN_CREATION");
  const [authorDeclaration, setAuthorDeclaration] = useState(false);
  const [isTosAccepted, setIsTosAccepted] = useState(false);

  // Data từ API
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Upload Logic State
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // Form validation errors
  const [fieldErrors, setFieldErrors] = useState({});

  const selectedCopyrightType = COPYRIGHT_TYPES.find(
    (c) => c.value === copyrightType,
  );

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
    setAuthorizationFile(null);
    setFormData({
      title: "",
      categoryId: "",
      publishYear: new Date().getFullYear(),
      description: "",
      author: "",
      publisher: "",
      isbn: "",
      englishTitle: "",
      language: "Tiếng Việt",
    });
    setCopyrightType("OWN_CREATION");
    setAuthorDeclaration(false);
    setIsTosAccepted(false);
    setUploadStatus("idle");
    setProgress(0);
    setError("");
    setFieldErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
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

  const validateAuthorizationFile = (selectedFile) => {
    if (!selectedFile) return false;
    if (!ACCEPTED_AUTHORIZATION_MIME_TYPES.includes(selectedFile.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        authorizationFile: "Chỉ chấp nhận file PDF, JPG hoặc PNG",
      }));
      return false;
    }
    if (selectedFile.size > MAX_AUTH_FILE_SIZE) {
      setFieldErrors((prev) => ({
        ...prev,
        authorizationFile: "File quá lớn (Giới hạn 10MB)",
      }));
      return false;
    }
    setFieldErrors((prev) => ({ ...prev, authorizationFile: "" }));
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

  const handleAuthorizationFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateAuthorizationFile(selectedFile)) {
        setAuthorizationFile(selectedFile);
      } else {
        setAuthorizationFile(null);
        e.target.value = "";
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById("file-upload-input");
    if (fileInput) fileInput.value = "";
  };

  const handleRemoveAuthorizationFile = () => {
    setAuthorizationFile(null);
    const input = document.getElementById("authorization-file-input");
    if (input) input.value = "";
  };

  // ==================== VALIDATION ====================

  const validateForm = () => {
    const errors = {};

    if (!file) {
      setError("Vui lòng chọn file tài liệu.");
      return false;
    }
    if (!formData.title.trim()) {
      errors.title = "Vui lòng nhập tên tài liệu";
    }
    if (!formData.categoryId) {
      errors.categoryId = "Vui lòng chọn danh mục";
    }
    if (copyrightType === "THIRD_PARTY_AUTHORIZED" && !authorizationFile) {
      errors.authorizationFile =
        "Bắt buộc phải tải lên giấy ủy quyền cho tài liệu bên thứ 3";
    }
    if (copyrightType === "OWN_CREATION" && !authorDeclaration) {
      errors.authorDeclaration = "Vui lòng xác nhận cam đoan tác giả";
    }
    if (!isTosAccepted) {
      errors.isTosAccepted = "Vui lòng đọc và đồng ý với Điều khoản Dịch vụ";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ==================== SUBMIT ====================

  const handleSubmit = async () => {
    setError("");
    if (!validateForm()) return;

    setUploadStatus("uploading");
    setProgress(0);

    try {
      const data = new FormData();

      // File chính
      data.append("file", file);

      // File giấy ủy quyền (nếu có)
      if (authorizationFile) {
        data.append("authorizationFile", authorizationFile);
      }

      // Metadata
      data.append("title", formData.title.trim());
      data.append("category", formData.categoryId);
      data.append("description", formData.description.trim());
      data.append("publishYear", formData.publishYear);
      if (formData.author) data.append("author", formData.author);
      if (formData.englishTitle)
        data.append("englishTitle", formData.englishTitle.trim());
      if (formData.isbn) data.append("isbn", formData.isbn.trim());
      if (formData.publisher) data.append("publisher", formData.publisher);
      data.append("language", formData.language);

      // [NEW] Copyright fields
      data.append("copyrightType", copyrightType);
      data.append("isTosAccepted", "true");
      data.append("authorDeclaration", String(authorDeclaration));

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

  // ==================== HELPERS ====================

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

  const renderFileIcon = (f) => {
    if (!f) return <FileIcon sx={{ fontSize: 32, color: "#8E8EA9" }} />;
    if (f.type === "application/epub+zip")
      return <EpubIcon sx={{ fontSize: 32, color: "#FF7043" }} />;
    return <PdfIcon sx={{ fontSize: 32, color: "#D32F2F" }} />;
  };

  const isUploading = uploadStatus === "uploading";
  const isSuccess = uploadStatus === "success";

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: "#FAFAFC",
      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#C4C4D4" },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#D32F2F",
        borderWidth: "2px",
      },
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "#D32F2F" },
  };

  // ==================== RENDER ====================

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
              sx={{ color: "#8E8EA9", "&:hover": { bgcolor: "#F0F0F5" } }}
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
                  "&:hover": { bgcolor: "#388E3C" },
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
                sx={{ mb: 3, borderRadius: "12px" }}
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
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                    mt: 2,
                  }}
                >
                  {[
                    { label: "PDF", color: "#D32F2F", Icon: PdfIcon },
                    { label: "EPUB", color: "#FF7043", Icon: EpubIcon },
                  ].map(({ label, color, Icon }) => (
                    <Box
                      key={label}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        px: 2,
                        py: 0.75,
                        borderRadius: "8px",
                        bgcolor: alpha(color, 0.1),
                      }}
                    >
                      <Icon sx={{ fontSize: 18, color }} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 600, color }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: "#C4C4D4", display: "block", mt: 2 }}
                >
                  Kích thước tối đa 50MB
                </Typography>
              </Box>
            ) : (
              /* FILE PREVIEW */
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
                    {renderFileIcon(file)}
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
                      "&:hover": { bgcolor: alpha("#D32F2F", 0.1) },
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
              <Grid item xs={12}>
                <TextField
                  label="Tên tài liệu *"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  disabled={isUploading}
                  error={!!fieldErrors.title}
                  helperText={fieldErrors.title}
                  placeholder="Ví dụ: Giáo trình lập trình Web nâng cao"
                  sx={textFieldStyles}
                />
              </Grid>

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

              <Grid item xs={12} md={6}>
                <TextField
                  label="Tên gốc/Tiếng Anh (Optional)"
                  name="englishTitle"
                  value={formData.englishTitle}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  placeholder="Ví dụ: Clean Code"
                  helperText="Giúp hệ thống liên kết dữ liệu Wikidata chính xác hơn"
                  sx={textFieldStyles}
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Giúp hệ thống liên kết dữ liệu Wikidata chính xác hơn">
                        <InfoOutlinedIcon
                          sx={{ color: "#8E8EA9", fontSize: 18 }}
                        />
                      </Tooltip>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="ISBN"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  placeholder="Ví dụ: 9786041234567"
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Nhà xuất bản"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  placeholder="Ví dụ: NXB Giáo dục, NXB Trẻ..."
                  sx={textFieldStyles}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Ngôn ngữ"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  fullWidth
                  disabled={isUploading}
                  sx={textFieldStyles}
                >
                  {[
                    "Tiếng Việt",
                    "Tiếng Anh",
                    "Tiếng Nhật",
                    "Tiếng Trung",
                    "Tiếng Hàn",
                    "Tiếng Pháp",
                    "Song ngữ Việt-Anh",
                    "Khác",
                  ].map((lang) => (
                    <MenuItem key={lang} value={lang}>
                      {lang}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

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
                  error={!!fieldErrors.categoryId}
                  helperText={fieldErrors.categoryId}
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

            {/* ========== [NEW] KHAI BÁO BẢN QUYỀN ========== */}
            <Divider sx={{ my: 3 }} />

            <Box
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  bgcolor: alpha("#7C4DFF", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GavelIcon sx={{ fontSize: 20, color: "#7C4DFF" }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "#1A1A2E",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Khai báo bản quyền
                </Typography>
                <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
                  Thông tin này giúp bảo vệ quyền lợi của bạn và nền tảng
                </Typography>
              </Box>
            </Box>

            {/* Copyright Type Selection */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              {COPYRIGHT_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = copyrightType === type.value;
                return (
                  <Grid item xs={12} md={4} key={type.value}>
                    <Paper
                      onClick={() => {
                        if (!isUploading) {
                          setCopyrightType(type.value);
                          setFieldErrors((prev) => ({
                            ...prev,
                            authorizationFile: "",
                            authorDeclaration: "",
                          }));
                          // Reset các state phụ thuộc
                          if (type.value !== "OWN_CREATION")
                            setAuthorDeclaration(false);
                          if (type.value !== "THIRD_PARTY_AUTHORIZED")
                            setAuthorizationFile(null);
                        }
                      }}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "12px",
                        border: "2px solid",
                        borderColor: isSelected ? type.color : "#F0F0F5",
                        bgcolor: isSelected
                          ? alpha(type.color, 0.05)
                          : "#FAFAFC",
                        cursor: isUploading ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        "&:hover": !isUploading
                          ? {
                              borderColor: type.color,
                              bgcolor: alpha(type.color, 0.04),
                            }
                          : {},
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.75,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 20,
                            color: isSelected ? type.color : "#8E8EA9",
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? type.color : "#4A4A68",
                            fontSize: "0.8rem",
                          }}
                        >
                          {type.label}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#8E8EA9",
                          lineHeight: 1.4,
                          display: "block",
                        }}
                      >
                        {type.description}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* Conditional: OWN_CREATION - Cam đoan tác giả */}
            {copyrightType === "OWN_CREATION" && (
              <Fade in>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    bgcolor: alpha("#4CAF50", 0.05),
                    border: "1px solid",
                    borderColor: fieldErrors.authorDeclaration
                      ? "#D32F2F"
                      : alpha("#4CAF50", 0.25),
                    mb: 2,
                  }}
                >
                  <FormControl error={!!fieldErrors.authorDeclaration}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={authorDeclaration}
                          onChange={(e) => {
                            setAuthorDeclaration(e.target.checked);
                            setFieldErrors((prev) => ({
                              ...prev,
                              authorDeclaration: "",
                            }));
                          }}
                          disabled={isUploading}
                          sx={{
                            color: "#4CAF50",
                            "&.Mui-checked": { color: "#4CAF50" },
                          }}
                        />
                      }
                      label={
                        <Typography
                          variant="body2"
                          sx={{ color: "#2E7D32", fontWeight: 500 }}
                        >
                          Tôi cam đoan rằng tôi là tác giả gốc hoặc đồng tác giả
                          của tài liệu này và có toàn quyền đăng tải nó lên hệ
                          thống.
                        </Typography>
                      }
                    />
                    {fieldErrors.authorDeclaration && (
                      <FormHelperText sx={{ ml: 4.5, mt: 0 }}>
                        {fieldErrors.authorDeclaration}
                      </FormHelperText>
                    )}
                  </FormControl>
                </Box>
              </Fade>
            )}

            {/* Conditional: THIRD_PARTY_AUTHORIZED - Upload giấy ủy quyền */}
            {copyrightType === "THIRD_PARTY_AUTHORIZED" && (
              <Fade in>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: "12px",
                    bgcolor: alpha("#FF9800", 0.05),
                    border: "1px solid",
                    borderColor: fieldErrors.authorizationFile
                      ? "#D32F2F"
                      : alpha("#FF9800", 0.3),
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <AttachFileIcon sx={{ fontSize: 18, color: "#FF9800" }} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: "#E65100" }}
                    >
                      Tải lên Giấy ủy quyền / Minh chứng bản quyền *
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: "#8E8EA9", display: "block", mb: 1.5 }}
                  >
                    Vui lòng đính kèm tài liệu chứng minh bạn được phép phân
                    phối tài liệu này (hợp đồng, email ủy quyền, giấy phép,...).
                    Chấp nhận: PDF, JPG, PNG (tối đa 10MB).
                  </Typography>

                  {!authorizationFile ? (
                    <Box
                      onClick={() =>
                        document
                          .getElementById("authorization-file-input")
                          .click()
                      }
                      sx={{
                        border: "2px dashed",
                        borderColor: fieldErrors.authorizationFile
                          ? "#D32F2F"
                          : "#FFB74D",
                        borderRadius: "10px",
                        p: 2.5,
                        textAlign: "center",
                        cursor: isUploading ? "not-allowed" : "pointer",
                        bgcolor: "white",
                        "&:hover": !isUploading
                          ? {
                              borderColor: "#FF9800",
                              bgcolor: alpha("#FF9800", 0.02),
                            }
                          : {},
                      }}
                    >
                      <input
                        id="authorization-file-input"
                        type="file"
                        accept={ACCEPTED_AUTHORIZATION_EXTENSIONS}
                        hidden
                        onChange={handleAuthorizationFileSelect}
                        disabled={isUploading}
                      />
                      <AttachFileIcon
                        sx={{ fontSize: 32, color: "#FFB74D", mb: 1 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#FF9800", fontWeight: 600 }}
                      >
                        Nhấn để chọn file
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#8E8EA9" }}>
                        PDF, JPG, PNG · Tối đa 10MB
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        borderRadius: "10px",
                        bgcolor: alpha("#4CAF50", 0.08),
                        border: "1px solid",
                        borderColor: alpha("#4CAF50", 0.2),
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <CheckCircleIcon
                          sx={{ color: "#4CAF50", fontSize: 22 }}
                        />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#1A1A2E" }}
                          >
                            {authorizationFile.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#8E8EA9" }}
                          >
                            {formatFileSize(authorizationFile.size)}
                          </Typography>
                        </Box>
                      </Box>
                      {!isUploading && (
                        <IconButton
                          size="small"
                          onClick={handleRemoveAuthorizationFile}
                          sx={{ color: "#D32F2F" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  )}

                  {fieldErrors.authorizationFile && (
                    <FormHelperText error sx={{ mt: 0.5 }}>
                      {fieldErrors.authorizationFile}
                    </FormHelperText>
                  )}
                </Box>
              </Fade>
            )}

            {/* ========== [NEW] ĐIỀU KHOẢN DỊCH VỤ ========== */}
            <Divider sx={{ my: 2 }} />

            <Box
              sx={{
                p: 2.5,
                borderRadius: "12px",
                bgcolor: fieldErrors.isTosAccepted
                  ? alpha("#D32F2F", 0.05)
                  : alpha("#1A1A2E", 0.03),
                border: "1px solid",
                borderColor: fieldErrors.isTosAccepted
                  ? alpha("#D32F2F", 0.3)
                  : "#E0E0E0",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <VerifiedIcon sx={{ fontSize: 18, color: "#D32F2F" }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "#1A1A2E" }}
                >
                  Điều khoản Dịch vụ & Chính sách Bản quyền
                </Typography>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  color: "#4A4A68",
                  lineHeight: 1.6,
                  display: "block",
                  mb: 1.5,
                }}
              >
                Bằng cách đăng tải, bạn xác nhận rằng nội dung này không vi phạm
                bản quyền, tuân thủ pháp luật Việt Nam và chính sách của VLU
                Library. Bạn hoàn toàn chịu trách nhiệm pháp lý nếu có tranh
                chấp bản quyền phát sinh.
              </Typography>

              <FormControl error={!!fieldErrors.isTosAccepted} fullWidth>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isTosAccepted}
                      onChange={(e) => {
                        setIsTosAccepted(e.target.checked);
                        setFieldErrors((prev) => ({
                          ...prev,
                          isTosAccepted: "",
                        }));
                      }}
                      disabled={isUploading}
                      sx={{
                        color: "#D32F2F",
                        "&.Mui-checked": { color: "#D32F2F" },
                      }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{ color: "#1A1A2E", fontWeight: 600 }}
                    >
                      Tôi đã đọc, hiểu và đồng ý với{" "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: "#D32F2F",
                          fontWeight: 700,
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        Điều khoản Dịch vụ
                      </Typography>{" "}
                      và{" "}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: "#D32F2F",
                          fontWeight: 700,
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        Chính sách Bản quyền
                      </Typography>{" "}
                      của VLU Library.
                    </Typography>
                  }
                />
                {fieldErrors.isTosAccepted && (
                  <FormHelperText sx={{ ml: 4.5, mt: 0 }}>
                    {fieldErrors.isTosAccepted}
                  </FormHelperText>
                )}
              </FormControl>
            </Box>
          </>
        )}
      </DialogContent>

      {/* ========== ACTIONS ========== */}
      {!isSuccess && (
        <DialogActions sx={{ p: 3, pt: 0 }}>
          {isUploading ? (
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
                  "&:hover": { borderColor: "#C4C4D4", bgcolor: "#FAFAFC" },
                }}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                startIcon={<UploadIcon />}
                disabled={!isTosAccepted}
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
                  "&:disabled": { bgcolor: "#C4C4D4", boxShadow: "none" },
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
