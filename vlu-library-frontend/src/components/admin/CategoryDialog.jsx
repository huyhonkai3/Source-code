import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Typography,
  alpha,
  CircularProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  Link as LinkIcon,
  Save as SaveIcon,
  FolderOpen as FolderIcon,
  Add as AddIcon,
  Edit as EditIcon,
  TextFields as TextFieldsIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { slugify } from "../../utils/slugify";

/**
 * CategoryDialog Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const CategoryDialog = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  mode = "create",
}) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [slug, setSlug] = useState("");
  const [errors, setErrors] = useState({});
  const NAME_MAX = 100;
  const DESC_MAX = 500;

  useEffect(() => {
    if (open && initialData && mode === "edit") {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
      setSlug(initialData.slug || slugify(initialData.name));
    } else if (open && mode === "create") {
      setFormData({ name: "", description: "" });
      setSlug("");
    }
    setErrors({});
  }, [open, initialData, mode]);

  useEffect(() => {
    if (formData.name) {
      setSlug(slugify(formData.name));
    } else {
      setSlug("");
    }
  }, [formData.name]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    if (field === "name" && value.length > NAME_MAX) return;
    if (field === "description" && value.length > DESC_MAX) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Tên danh mục là bắt buộc";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Tên danh mục phải có ít nhất 2 ký tự";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", description: "" });
      setSlug("");
      setErrors({});
      onClose();
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const isCreate = mode === "create";
  const themeColor = "#7C4DFF";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", overflow: "hidden" } }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${themeColor} 0%, #448AFF 100%)`,
          color: "white",
          p: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "14px",
                bgcolor: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isCreate ? (
                <AddIcon sx={{ fontSize: 24 }} />
              ) : (
                <EditIcon sx={{ fontSize: 24 }} />
              )}
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: "1.25rem",
                }}
              >
                {isCreate ? "Thêm Danh mục mới" : "Cập nhật Danh mục"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ opacity: 0.9, mt: 0.25, fontSize: "0.9375rem" }}
              >
                {isCreate
                  ? "Tạo danh mục mới để phân loại tài liệu"
                  : "Chỉnh sửa thông tin danh mục"}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: "white",
              bgcolor: "rgba(255,255,255,0.1)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.9375rem",
              }}
            >
              <TextFieldsIcon sx={{ fontSize: 18, color: themeColor }} />
              Tên danh mục
              <Typography component="span" sx={{ color: "#EF4444" }}>
                *
              </Typography>
            </Typography>
            <TextField
              fullWidth
              value={formData.name}
              onChange={handleChange("name")}
              onKeyPress={handleKeyPress}
              disabled={loading}
              error={Boolean(errors.name)}
              helperText={
                errors.name || `${formData.name.length}/${NAME_MAX} ký tự`
              }
              placeholder="VD: Khoa học máy tính, Kiến trúc..."
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "#FAFAFC",
                  fontSize: "0.9375rem",
                  "&:hover": { bgcolor: "#F0F0F5" },
                  "&.Mui-focused": { bgcolor: "white" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: themeColor,
                    borderWidth: 2,
                  },
                },
                "& .MuiFormHelperText-root": {
                  textAlign: "right",
                  mx: 0,
                  fontSize: "0.8125rem",
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.9375rem",
              }}
            >
              <LinkIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
              Đường dẫn tĩnh (Slug)
            </Typography>
            <TextField
              fullWidth
              value={slug}
              disabled
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#8E8EA9",
                        fontFamily: "monospace",
                        fontSize: "0.875rem",
                      }}
                    >
                      /category/
                    </Typography>
                  </InputAdornment>
                ),
              }}
              helperText="Được tạo tự động từ tên danh mục"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "#F0F0F5",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent",
                  },
                },
                "& .MuiInputBase-input": {
                  fontFamily: "monospace",
                  color: "#4A4A68",
                  fontSize: "0.9375rem",
                },
                "& .MuiFormHelperText-root": { mx: 0, fontSize: "0.8125rem" },
              }}
            />
          </Box>

          <Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: "0.9375rem",
              }}
            >
              <DescriptionIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
              Mô tả
              <Typography
                component="span"
                sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}
              >
                (Tùy chọn)
              </Typography>
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange("description")}
              disabled={loading}
              placeholder="Nhập mô tả ngắn gọn về danh mục này..."
              helperText={`${formData.description.length}/${DESC_MAX} ký tự`}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: "#FAFAFC",
                  fontSize: "0.9375rem",
                  "&:hover": { bgcolor: "#F0F0F5" },
                  "&.Mui-focused": { bgcolor: "white" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: themeColor,
                    borderWidth: 2,
                  },
                },
                "& .MuiFormHelperText-root": {
                  textAlign: "right",
                  mx: 0,
                  fontSize: "0.8125rem",
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1.5 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{
            minWidth: 120,
            borderRadius: "12px",
            borderColor: "#E0E0E0",
            color: "#4A4A68",
            fontWeight: 600,
            py: 1.25,
            fontSize: "0.9375rem",
            "&:hover": { borderColor: "#C4C4D4", bgcolor: "#F0F0F5" },
          }}
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          variant="contained"
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            minWidth: 160,
            borderRadius: "12px",
            fontWeight: 600,
            py: 1.25,
            fontSize: "0.9375rem",
            bgcolor: themeColor,
            boxShadow: `0 4px 14px ${alpha(themeColor, 0.4)}`,
            "&:hover": {
              bgcolor: "#6B3FE8",
              boxShadow: `0 6px 20px ${alpha(themeColor, 0.5)}`,
            },
            "&:disabled": { bgcolor: "#C4C4D4" },
          }}
        >
          {loading ? "Đang lưu..." : isCreate ? "Tạo danh mục" : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
