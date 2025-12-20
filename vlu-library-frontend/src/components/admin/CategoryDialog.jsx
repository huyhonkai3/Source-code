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
} from "@mui/material";
import {
  Close as CloseIcon,
  Link as LinkIcon,
  Save as SaveIcon,
  FolderOpen as FolderIcon,
} from "@mui/icons-material";
import { slugify } from "../../utils/slugify";

/**
 * CategoryDialog Component
 * Form dialog for creating/editing categories
 *
 * @param {boolean} open - Dialog visibility
 * @param {Function} onClose - Close handler
 * @param {Function} onSubmit - Submit handler (receives { name, description })
 * @param {Object} initialData - Initial category data for edit mode
 * @param {boolean} loading - Loading state
 * @param {string} mode - 'create' or 'edit'
 */
const CategoryDialog = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  mode = "create",
}) => {
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Auto-generated slug (for preview only)
  const [slug, setSlug] = useState("");

  // Validation errors
  const [errors, setErrors] = useState({});

  /**
   * Load initial data when dialog opens in edit mode
   */
  useEffect(() => {
    if (open && initialData && mode === "edit") {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
      });
      setSlug(initialData.slug || slugify(initialData.name));
    } else if (open && mode === "create") {
      setFormData({
        name: "",
        description: "",
      });
      setSlug("");
    }
  }, [open, initialData, mode]);

  /**
   * Auto-generate slug when name changes
   */
  useEffect(() => {
    if (formData.name) {
      setSlug(slugify(formData.name));
    } else {
      setSlug("");
    }
  }, [formData.name]);

  /**
   * Handle input change
   */
  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  /**
   * Validate form
   */
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

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    if (!validate()) return;

    // Only send name and description
    // Backend will generate slug automatically
    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim(),
    });
  };

  /**
   * Handle close - Reset form
   */
  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", description: "" });
      setSlug("");
      setErrors({});
      onClose();
    }
  };

  /**
   * Handle Enter key
   */
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Title */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pb: 2,
        }}
      >
        {/* Icon */}
        <FolderIcon
          sx={{
            color: "error.main",
            fontSize: 28,
          }}
        />

        {/* Title Text */}
        <Box sx={{ flex: 1 }}>
          <Box
            component="span"
            sx={{
              fontSize: "1.25rem",
              fontWeight: "bold",
            }}
          >
            {mode === "create" ? "Thêm Danh mục mới" : "Cập nhật Danh mục"}
          </Box>
        </Box>

        {/* Close Button */}
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Category Name */}
          <TextField
            label="Tên danh mục"
            required
            fullWidth
            value={formData.name}
            onChange={handleChange("name")}
            onKeyPress={handleKeyPress}
            disabled={loading}
            error={Boolean(errors.name)}
            helperText={errors.name}
            placeholder="Nhập tên danh mục (VD: Khoa học máy tính)"
            autoFocus
          />

          {/* Slug Preview */}
          <TextField
            label="Đường dẫn tĩnh (Slug)"
            fullWidth
            value={slug}
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon color="action" />
                </InputAdornment>
              ),
            }}
            helperText="URL sẽ được tạo tự động từ tên danh mục"
            sx={{
              "& .MuiInputBase-input.Mui-disabled": {
                WebkitTextFillColor: "text.secondary",
              },
            }}
          />

          {/* Description */}
          <TextField
            label="Mô tả (Tùy chọn)"
            fullWidth
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange("description")}
            disabled={loading}
            placeholder="Nhập mô tả ngắn gọn về danh mục này..."
            helperText={`${formData.description.length} ký tự`}
          />
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 1.5,
        }}
      >
        {/* Cancel Button */}
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          color="inherit"
          sx={{
            minWidth: 100,
            borderColor: "divider",
            color: "text.secondary",
            "&:hover": {
              borderColor: "text.secondary",
              backgroundColor: "action.hover",
            },
          }}
        >
          Hủy bỏ
        </Button>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !formData.name.trim()}
          variant="contained"
          color="error"
          startIcon={<SaveIcon />}
          sx={{
            minWidth: 150,
            fontWeight: 600,
          }}
        >
          {loading
            ? "Đang lưu..."
            : mode === "create"
              ? "Lưu Danh mục"
              : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
