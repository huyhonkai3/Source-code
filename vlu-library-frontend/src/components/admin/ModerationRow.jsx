import {
  TableRow,
  TableCell,
  Box,
  Typography,
  Avatar,
  Button,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * ModerationRow Component
 * Hiển thị một dòng tài liệu trong bảng kiểm duyệt
 *
 * @param {Object} document - Document data object
 * @param {number} currentTab - Current tab index (0: pending, 1: approved, 2: rejected)
 * @param {Function} onReview - Callback khi click "Xem xét"
 */
const ModerationRow = ({ document, currentTab = 0, onReview }) => {
  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  /**
   * Format relative time
   */
  const formatRelativeTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: vi,
      });
    } catch (error) {
      return "N/A";
    }
  };

  /**
   * Get author name
   */
  const getAuthorName = () => {
    if (document.uploadedBy?.name) {
      return document.uploadedBy.name;
    }
    return document.author || "N/A";
  };

  /**
   * Get author initial for avatar
   */
  const getAuthorInitial = () => {
    const name = getAuthorName();
    return name.charAt(0).toUpperCase();
  };

  /**
   * Get reviewer name
   */
  const getReviewerName = () => {
    if (document.reviewedBy?.name) {
      return document.reviewedBy.name;
    }
    return "Chưa rõ";
  };

  /**
   * Get reviewer initial for avatar
   */
  const getReviewerInitial = () => {
    const name = getReviewerName();
    if (name === "Chưa rõ") return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <TableRow
      hover
      sx={{
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      {/* Cột Tài liệu */}
      <TableCell>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {/* PDF Icon */}
          <Avatar
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              backgroundColor: "#FFEBEE", // Light red background
              color: "#D32F2F",
            }}
          >
            <PdfIcon />
          </Avatar>

          {/* Document Info */}
          <Box>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                mb: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {document.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {document.fileFormat.toUpperCase()} •{" "}
              {formatFileSize(document.fileSize)}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Cột tác giả */}
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: "0.875rem",
              backgroundColor: "grey.300",
              color: "grey.700",
            }}
          >
            {getAuthorInitial()}
          </Avatar>
          <Typography variant="body2">{getAuthorName()}</Typography>
        </Box>
      </TableCell>

      {/* Cột danh mục */}
      <TableCell>
        <Typography variant="body2">
          {document.category?.name || "N/A"}
        </Typography>
      </TableCell>

      {/* Cột thời gian gửi */}
      <TableCell>
        <Typography variant="body2" color="text.secondary">
          {formatRelativeTime(document.createdAt)}
        </Typography>
      </TableCell>

      {/* Cột hành động / Người thực hiện (conditional) */}
      <TableCell align={currentTab === 0 ? "right" : "left"}>
        {currentTab === 0 ? (
          // Pending tab - Show action button
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => onReview(document._id || document.id)}
            sx={{
              textTransform: "none",
              borderRadius: 1,
              px: 2,
            }}
          >
            Xem xét
          </Button>
        ) : (
          // Approved/Rejected tabs - Show reviewer info
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.875rem",
                backgroundColor: "primary.lighter",
                color: "primary.main",
              }}
            >
              {getReviewerInitial()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {getReviewerName()}
              </Typography>
              {document.reviewedBy?.role && (
                <Typography variant="caption" color="text.secondary">
                  {document.reviewedBy.role === "Admin"
                    ? "Quản trị viên"
                    : "Kiểm duyệt viên"}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </TableCell>
    </TableRow>
  );
};

export default ModerationRow;
