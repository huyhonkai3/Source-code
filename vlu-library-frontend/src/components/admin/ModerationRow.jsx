import {
  TableCell,
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  PictureAsPdf as PdfIcon,
  Description as EpubIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Folder as FolderIcon,
  Verified as VerifiedIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * ModerationRow Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes để UX tốt hơn
 */
const ModerationRow = ({ document, currentTab = 0, onReview, userRole }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(0)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

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

  const getFileTypeInfo = () => {
    const format = document.fileFormat?.toLowerCase();
    if (format === "pdf") {
      return {
        icon: PdfIcon,
        color: "#D32F2F",
        bgColor: "#FFEBEE",
        label: "PDF",
      };
    } else if (format === "epub") {
      return {
        icon: EpubIcon,
        color: "#7C4DFF",
        bgColor: "#EDE7F6",
        label: "EPUB",
      };
    }
    return {
      icon: PdfIcon,
      color: "#D32F2F",
      bgColor: "#FFEBEE",
      label: "DOC",
    };
  };

  const getAuthorName = () =>
    document.uploadedBy?.name || document.author || "Không rõ";
  const getAuthorInitial = () => getAuthorName().charAt(0).toUpperCase();
  const getReviewerName = () => document.reviewedBy?.name || "Chưa rõ";
  const getReviewerInitial = () => {
    const name = getReviewerName();
    return name === "Chưa rõ" ? "?" : name.charAt(0).toUpperCase();
  };

  const getReviewerRoleInfo = () => {
    const role = document.reviewedBy?.role;
    if (role === "Admin") {
      return {
        label: "Quản trị viên",
        color: "#D32F2F",
        bgColor: "#FFEBEE",
        icon: AdminIcon,
      };
    }
    return {
      label: "Kiểm duyệt viên",
      color: "#2196F3",
      bgColor: "#E3F2FD",
      icon: VerifiedIcon,
    };
  };

  const fileTypeInfo = getFileTypeInfo();
  const FileIcon = fileTypeInfo.icon;

  return (
    <>
      {/* Cột Tài liệu */}
      <TableCell
        sx={{ py: 2.5, borderBottom: "1px solid", borderColor: "#F0F0F5" }}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Tooltip title={fileTypeInfo.label} arrow placement="top">
            <Avatar
              variant="rounded"
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                backgroundColor: fileTypeInfo.bgColor,
                color: fileTypeInfo.color,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: `0 4px 12px ${alpha(fileTypeInfo.color, 0.3)}`,
                },
              }}
            >
              <FileIcon sx={{ fontSize: 26 }} />
            </Avatar>
          </Tooltip>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#1A1A2E",
                mb: 0.5,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.4,
                fontSize: "0.9375rem",
                "&:hover": { color: "#D32F2F" },
                transition: "color 0.2s ease",
                cursor: "pointer",
              }}
              onClick={() => onReview(document._id || document.id)}
            >
              {document.title}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={fileTypeInfo.label}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  bgcolor: fileTypeInfo.bgColor,
                  color: fileTypeInfo.color,
                  "& .MuiChip-label": { px: 1 },
                }}
              />
              <Typography
                sx={{
                  color: "#8E8EA9",
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                }}
              >
                {formatFileSize(document.fileSize)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </TableCell>

      {/* Cột Tác giả */}
      <TableCell
        sx={{ py: 2.5, borderBottom: "1px solid", borderColor: "#F0F0F5" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: "0.9375rem",
              fontWeight: 600,
              background: "linear-gradient(135deg, #4A4A68 0%, #1A1A2E 100%)",
              color: "white",
            }}
          >
            {getAuthorInitial()}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#1A1A2E", fontSize: "0.9375rem" }}
            >
              {getAuthorName()}
            </Typography>
            <Typography
              sx={{
                color: "#8E8EA9",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: "0.8125rem",
              }}
            >
              <PersonIcon sx={{ fontSize: 12 }} />
              Người đăng
            </Typography>
          </Box>
        </Box>
      </TableCell>

      {/* Cột Danh mục */}
      <TableCell
        sx={{ py: 2.5, borderBottom: "1px solid", borderColor: "#F0F0F5" }}
      >
        <Chip
          icon={<FolderIcon sx={{ fontSize: 14 }} />}
          label={document.category?.name || "Chưa phân loại"}
          size="small"
          sx={{
            bgcolor: "#F0F0F5",
            color: "#4A4A68",
            fontWeight: 500,
            borderRadius: "8px",
            fontSize: "0.8125rem",
            "& .MuiChip-icon": { color: "#8E8EA9" },
          }}
        />
      </TableCell>

      {/* Cột Thời gian */}
      <TableCell
        sx={{ py: 2.5, borderBottom: "1px solid", borderColor: "#F0F0F5" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ScheduleIcon sx={{ fontSize: 16, color: "#8E8EA9" }} />
          <Typography
            variant="body2"
            sx={{ color: "#4A4A68", fontWeight: 500, fontSize: "0.875rem" }}
          >
            {formatRelativeTime(document.createdAt)}
          </Typography>
        </Box>
      </TableCell>

      {/* Cột Hành động / Người duyệt */}
      <TableCell
        align={currentTab === 0 ? "center" : "left"}
        sx={{ py: 2.5, borderBottom: "1px solid", borderColor: "#F0F0F5" }}
      >
        {currentTab === 0 ? (
          userRole === "Moderator" ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => onReview(document._id || document.id)}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                px: 2.5,
                py: 1,
                fontWeight: 600,
                fontSize: "0.875rem",
                bgcolor: "#D32F2F",
                boxShadow: "0 4px 14px rgba(211, 47, 47, 0.3)",
                "&:hover": { bgcolor: "#B71C1C" },
              }}
            >
              Xem xét
            </Button>
          ) : (
            <Typography
              variant="body2"
              sx={{
                color: "#8E8EA9",
                fontStyle: "italic",
                fontSize: "0.8125rem",
              }}
            >
              Chức năng này chỉ dành cho Kiểm duyệt viên
            </Typography>
          )
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                fontSize: "0.9375rem",
                fontWeight: 600,
                background: `linear-gradient(135deg, ${getReviewerRoleInfo().color} 0%, ${alpha(getReviewerRoleInfo().color, 0.7)} 100%)`,
                color: "white",
              }}
            >
              {getReviewerInitial()}
            </Avatar>
            <Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#1A1A2E",
                  fontSize: "0.9375rem",
                }}
              >
                {getReviewerName()}
              </Typography>
              {document.reviewedBy?.role && (
                <Chip
                  icon={
                    <Box
                      component={getReviewerRoleInfo().icon}
                      sx={{ fontSize: "12px !important" }}
                    />
                  }
                  label={getReviewerRoleInfo().label}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    bgcolor: getReviewerRoleInfo().bgColor,
                    color: getReviewerRoleInfo().color,
                    "& .MuiChip-label": { px: 0.5 },
                    "& .MuiChip-icon": { ml: 0.5 },
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </TableCell>
    </>
  );
};

export default ModerationRow;
