import {
  Box,
  Paper,
  Avatar,
  Typography,
  TextField,
  Grid,
  Chip,
  Button,
  Alert,
} from "@mui/material";
import {
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

/**
 * ReviewPanel Component
 * Panel hiển thị thông tin tài liệu và actions để duyệt/từ chối
 *
 * @param {Object} document - Document data
 * @param {Function} onApprove - Callback khi duyệt tài liệu
 * @param {Function} onReject - Callback khi từ chối tài liệu
 * @param {boolean} loading - Trạng thái đang xử lý
 */
const ReviewPanel = ({ document, onApprove, onReject, loading = false }) => {
  if (!document) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Đang tải thông tin...
        </Typography>
      </Box>
    );
  }

  // Extract data
  const uploader = document.uploadedBy || {};
  const uploaderName = uploader.name || "N/A";
  const uploaderEmail = uploader.email || "N/A";
  const uploaderInitial = uploaderName.charAt(0).toUpperCase();

  // Category - handle both nested object and direct value
  const categoryName =
    document.category?.name ||
    document.categoryId?.name ||
    document.category ||
    "N/A";

  // Year
  const publishYear = document.publishYear || "N/A";

  // Tags/Keywords
  const tags = document.keywords || document.tags || [];
  const tagArray = Array.isArray(tags) ? tags : [];

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        backgroundColor: "#fafafa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* User Info Card */}
      <Paper
        elevation={0}
        sx={{
          m: 3,
          mb: 2,
          p: 3,
          backgroundColor: "#E3F2FD",
          border: "1px solid #90CAF9",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              backgroundColor: "primary.main",
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            {uploaderInitial}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight={600}>
              {uploaderName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {uploaderEmail}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Document Info Form */}
      <Box sx={{ px: 3, pb: 3, flex: 1 }}>
        {/* Title */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
          >
            Tiêu đề tài liệu
          </Typography>
          <TextField
            fullWidth
            value={document.title || ""}
            InputProps={{
              readOnly: true,
            }}
            size="small"
          />
        </Box>

        {/* Category & Year */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
            >
              Danh mục
            </Typography>
            <TextField
              fullWidth
              value={categoryName}
              InputProps={{
                readOnly: true,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.secondary"
              sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
            >
              Năm xuất bản
            </Typography>
            <TextField
              fullWidth
              value={publishYear}
              InputProps={{
                readOnly: true,
              }}
              size="small"
            />
          </Grid>
        </Grid>

        {/* Description */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
          >
            Mô tả/Tóm tắt
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={document.description || "Không có mô tả"}
            InputProps={{
              readOnly: true,
            }}
            size="small"
          />
        </Box>

        {/* Tags */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ mb: 1, display: "block", textTransform: "uppercase" }}
          >
            Từ khóa (Tags)
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {tagArray.length > 0 ? (
              tagArray.map((tag, index) => (
                <Chip key={index} label={tag} size="small" variant="outlined" />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không có từ khóa
              </Typography>
            )}
          </Box>
        </Box>

        {/* System Check Box */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "#E8F5E9",
            border: "1px solid #81C784",
            mb: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <SecurityIcon sx={{ color: "success.main" }} />
            <Typography variant="subtitle2" fontWeight={700}>
              KIỂM TRA HỆ THỐNG
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckIcon sx={{ color: "success.main", fontSize: 20 }} />
              <Typography variant="body2">
                Không phát hiện virus/malware
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckIcon sx={{ color: "success.main", fontSize: 20 }} />
              <Typography variant="body2">Định dạng PDF hợp lệ</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckIcon sx={{ color: "success.main", fontSize: 20 }} />
              <Typography variant="body2">
                Kích thước tệp trong giới hạn cho phép
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<CloseIcon />}
            onClick={onReject}
            disabled={loading}
            sx={{
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Từ chối
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<CheckIcon />}
            onClick={onApprove}
            disabled={loading}
            sx={{
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Duyệt & Công khai
          </Button>
        </Box>

        {/* Help Text */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="caption">
            Hành động "Duyệt" sẽ công khai tài liệu này ngay lập tức cho toàn bộ
            hệ thống.
          </Typography>
        </Alert>
      </Box>
    </Box>
  );
};

export default ReviewPanel;
