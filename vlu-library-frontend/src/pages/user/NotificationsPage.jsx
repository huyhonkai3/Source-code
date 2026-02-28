import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Avatar,
  Skeleton,
  Alert,
  Divider,
  alpha,
} from "@mui/material";
import {
  Article as ArticleIcon,
  PersonAdd as PersonAddIcon,
  ExpandMore as ExpandMoreIcon,
  DoneAll as DoneAllIcon,
  Notifications as NotificationsIcon,
  NotificationsNone as NotificationsNoneIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../../components/user/UserSidebar";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../../api/notifications.api";

// ============================================================
// DATE FORMATTING HELPERS
// (Dùng native JS thay vì date-fns)
// ============================================================

const formatRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatFullDate = (dateStr) => {
  return new Date(dateStr).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================================
// SKELETON LOADING
// ============================================================

const NotificationSkeleton = () => (
  <Box sx={{ mb: 2 }}>
    {[1, 2, 3, 4].map((i) => (
      <Box
        key={i}
        sx={{
          mb: 2,
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #F0F0F5",
        }}
      >
        <Box sx={{ p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={22} />
            <Skeleton variant="text" width="40%" height={18} sx={{ mt: 0.5 }} />
          </Box>
          <Skeleton variant="rounded" width={80} height={28} />
        </Box>
      </Box>
    ))}
  </Box>
);

// ============================================================
// SINGLE NOTIFICATION ITEM
// ============================================================

const NotificationItem = ({ notification, onRead }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const isDocument = notification.type === "DOCUMENT_MODERATION";
  const isApproved =
    notification.title.includes("được duyệt") ||
    notification.title.includes("chấp thuận");

  // Icon và màu theo type
  const typeConfig = {
    DOCUMENT_MODERATION: {
      icon: ArticleIcon,
      color: "#2196F3",
      bgColor: alpha("#2196F3", 0.1),
      label: "Tài liệu",
    },
    UPGRADE_REQUEST: {
      icon: PersonAddIcon,
      color: "#7C4DFF",
      bgColor: alpha("#7C4DFF", 0.1),
      label: "Nâng cấp quyền",
    },
  };

  const config =
    typeConfig[notification.type] || typeConfig.DOCUMENT_MODERATION;
  const TypeIcon = config.icon;

  const handleChange = async (_, isExpanded) => {
    setExpanded(isExpanded);
    // Đánh dấu đã đọc khi mở accordion
    if (isExpanded && !notification.isRead) {
      try {
        await markAsRead(notification.id);
        onRead(notification.id);
      } catch (err) {
        // Silent fail
      }
    }
  };

  const handleNavigate = () => {
    if (isDocument) {
      navigate("/author/documents");
    } else {
      navigate("/profile");
    }
  };

  return (
    <Accordion
      expanded={expanded}
      onChange={handleChange}
      disableGutters
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: "16px !important",
        border: notification.isRead ? "1px solid #F0F0F5" : "1px solid",
        borderColor: notification.isRead ? "#F0F0F5" : `${config.color}40`,
        overflow: "hidden",
        boxShadow: notification.isRead
          ? "0 1px 4px rgba(26,26,46,0.04)"
          : `0 2px 12px ${config.color}18`,
        transition: "all 0.25s ease",
        "&:hover": {
          boxShadow: `0 4px 20px ${config.color}20`,
          borderColor: `${config.color}60`,
        },
        "&::before": {
          display: "none", // Xóa gạch ngang mặc định của Accordion
        },
        "&.Mui-expanded": {
          boxShadow: `0 6px 24px ${config.color}25`,
          borderColor: `${config.color}80`,
        },
      }}
    >
      {/* ========== ACCORDION SUMMARY (Thu gọn) ========== */}
      <AccordionSummary
        expandIcon={
          <ExpandMoreIcon sx={{ color: config.color, fontSize: 22 }} />
        }
        sx={{
          px: 2.5,
          py: 0.5,
          minHeight: 72,
          bgcolor: notification.isRead ? "white" : alpha(config.color, 0.03),
          "&:hover": {
            bgcolor: alpha(config.color, 0.05),
          },
          "& .MuiAccordionSummary-content": {
            my: 1.5,
            alignItems: "center",
            gap: 2,
          },
        }}
      >
        {/* Icon Avatar */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            bgcolor: config.bgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <TypeIcon sx={{ fontSize: 22, color: config.color }} />
        </Box>

        {/* Title & Time */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Unread dot */}
            {!notification.isRead && (
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "#D32F2F",
                  flexShrink: 0,
                }}
              />
            )}
            <Typography
              sx={{
                fontWeight: notification.isRead ? 500 : 700,
                color: notification.isRead ? "#4A4A68" : "#1A1A2E",
                fontSize: "0.9375rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {notification.title}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: "0.8125rem",
              color: "#8E8EA9",
              mt: 0.25,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {notification.message.length > 70
              ? notification.message.slice(0, 70) + "..."
              : notification.message}
          </Typography>
        </Box>

        {/* Right: Chips & Time */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <Chip
            size="small"
            label={config.label}
            sx={{
              bgcolor: config.bgColor,
              color: config.color,
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 24,
            }}
          />
          <Typography
            sx={{ fontSize: "0.75rem", color: "#A0A0B4", fontWeight: 500 }}
          >
            {formatRelativeTime(notification.createdAt)}
          </Typography>
        </Box>
      </AccordionSummary>

      {/* ========== ACCORDION DETAILS (Mở rộng) ========== */}
      <AccordionDetails
        sx={{
          px: 2.5,
          pb: 2.5,
          bgcolor: alpha(config.color, 0.02),
          borderTop: "1px dashed",
          borderColor: alpha(config.color, 0.15),
        }}
      >
        {/* Full message */}
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: "white",
            border: "1px solid #F0F0F5",
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9375rem",
              color: "#2A2A3E",
              lineHeight: 1.7,
            }}
          >
            {notification.message}
          </Typography>
        </Box>

        {/* Info Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
            mb: 2,
          }}
        >
          {/* Người thực hiện */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "white",
              border: "1px solid #F0F0F5",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: alpha("#8E8EA9", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <PersonIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "0.75rem", color: "#8E8EA9", fontWeight: 500 }}
              >
                Người thực hiện
              </Typography>
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A2E" }}
              >
                {notification.actionBy?.name || "Hệ thống"}
              </Typography>
            </Box>
          </Box>

          {/* Thời gian chi tiết */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "white",
              border: "1px solid #F0F0F5",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: alpha("#8E8EA9", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ScheduleIcon sx={{ fontSize: 18, color: "#8E8EA9" }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: "0.75rem", color: "#8E8EA9", fontWeight: 500 }}
              >
                Thời gian
              </Typography>
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 600, color: "#1A1A2E" }}
              >
                {formatFullDate(notification.createdAt)}
              </Typography>
            </Box>
          </Box>

          {/* Tài liệu liên quan - chỉ hiện nếu có */}
          {notification.relatedDocument && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: "10px",
                bgcolor: "white",
                border: "1px solid #F0F0F5",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                gridColumn: { xs: "1", sm: "1 / -1" },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  bgcolor: alpha("#2196F3", 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ArticleIcon sx={{ fontSize: 18, color: "#2196F3" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "#8E8EA9",
                    fontWeight: 500,
                  }}
                >
                  Tài liệu liên quan
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#1A1A2E",
                  }}
                >
                  {notification.relatedDocument.title}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Status Badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isApproved ? (
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: "16px !important" }} />}
                label="Đã được chấp thuận"
                size="small"
                sx={{
                  bgcolor: alpha("#4CAF50", 0.1),
                  color: "#4CAF50",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  "& .MuiChip-icon": { color: "#4CAF50" },
                }}
              />
            ) : (
              <Chip
                icon={<CancelIcon sx={{ fontSize: "16px !important" }} />}
                label="Đã bị từ chối"
                size="small"
                sx={{
                  bgcolor: alpha("#D32F2F", 0.1),
                  color: "#D32F2F",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  "& .MuiChip-icon": { color: "#D32F2F" },
                }}
              />
            )}
          </Box>

          {/* CTA Button */}
          <Button
            size="small"
            variant="contained"
            endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
            onClick={handleNavigate}
            sx={{
              bgcolor: config.color,
              color: "white",
              borderRadius: "8px",
              px: 2,
              py: 0.75,
              fontWeight: 600,
              fontSize: "0.8125rem",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                bgcolor: config.color,
                filter: "brightness(0.9)",
                boxShadow: `0 4px 12px ${config.color}40`,
              },
            }}
          >
            {isDocument ? "Xem tài liệu của tôi" : "Xem hồ sơ"}
          </Button>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

// ============================================================
// MAIN PAGE
// ============================================================

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications({ limit: 50 });
      const list = data?.data?.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Callback khi 1 thông báo được đánh dấu đã đọc
  const handleRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Đánh dấu tất cả đã đọc
  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  return (
    <Box sx={{ bgcolor: "#FAFAFC", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ display: "flex", gap: 3 }}>
          {/* ========== SIDEBAR ========== */}
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <UserSidebar active="notifications" />
          </Box>

          {/* ========== MAIN CONTENT ========== */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Page Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "12px",
                      bgcolor: alpha("#FFC107", 0.15),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <NotificationsIcon
                      sx={{ color: "#FFC107", fontSize: 22 }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, color: "#1A1A2E" }}
                  >
                    Thông báo
                  </Typography>
                  {unreadCount > 0 && (
                    <Box
                      sx={{
                        px: 1.25,
                        py: 0.25,
                        bgcolor: "#D32F2F",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        lineHeight: 1.5,
                      }}
                    >
                      {unreadCount} mới
                    </Box>
                  )}
                </Box>
                <Typography sx={{ color: "#8E8EA9", fontSize: "0.9375rem" }}>
                  Theo dõi tất cả hoạt động của tài khoản bạn
                </Typography>
              </Box>

              {unreadCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<DoneAllIcon />}
                  onClick={handleMarkAllRead}
                  sx={{
                    borderColor: "#E0E0E0",
                    color: "#4A4A68",
                    borderRadius: "10px",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#2196F3",
                      color: "#2196F3",
                      bgcolor: alpha("#2196F3", 0.04),
                    },
                  }}
                >
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </Box>

            {/* ========== CONTENT AREA ========== */}
            {loading ? (
              <NotificationSkeleton />
            ) : error ? (
              <Alert
                severity="error"
                sx={{ borderRadius: "12px" }}
                action={
                  <Button
                    size="small"
                    onClick={fetchNotifications}
                    sx={{ fontWeight: 600 }}
                  >
                    Thử lại
                  </Button>
                }
              >
                {error}
              </Alert>
            ) : notifications.length === 0 ? (
              // Empty State
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 10,
                  bgcolor: "white",
                  borderRadius: "20px",
                  border: "1px solid #F0F0F5",
                  boxShadow: "0 2px 12px rgba(26,26,46,0.05)",
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "24px",
                    bgcolor: alpha("#FFC107", 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <NotificationsNoneIcon
                    sx={{ fontSize: 40, color: "#FFC107" }}
                  />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#1A1A2E", mb: 1 }}
                >
                  Chưa có thông báo nào
                </Typography>
                <Typography
                  sx={{
                    color: "#8E8EA9",
                    fontSize: "0.9375rem",
                    textAlign: "center",
                    maxWidth: 320,
                  }}
                >
                  Khi có cập nhật về tài liệu hoặc quyền hạn, bạn sẽ nhận được
                  thông báo tại đây.
                </Typography>
              </Box>
            ) : (
              // Notification List
              <Box>
                {/* Unread Section */}
                {notifications.some((n) => !n.isRead) && (
                  <>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "#8E8EA9",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        mb: 1.5,
                      }}
                    >
                      Chưa đọc ({notifications.filter((n) => !n.isRead).length})
                    </Typography>
                    {notifications
                      .filter((n) => !n.isRead)
                      .map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={handleRead}
                        />
                      ))}
                    {notifications.some((n) => n.isRead) && (
                      <Divider sx={{ my: 3, borderColor: "#F0F0F5" }} />
                    )}
                  </>
                )}

                {/* Read Section */}
                {notifications.some((n) => n.isRead) && (
                  <>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "#8E8EA9",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        mb: 1.5,
                      }}
                    >
                      Đã đọc ({notifications.filter((n) => n.isRead).length})
                    </Typography>
                    {notifications
                      .filter((n) => n.isRead)
                      .map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={handleRead}
                        />
                      ))}
                  </>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotificationsPage;
