import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  alpha,
  Fade,
} from "@mui/material";
import {
  ManageAccounts as ManageAccountsIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Create as CreateIcon,
  Shield as ShieldIcon,
  AdminPanelSettings as AdminIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/**
 * UserTable Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes - giữ nguyên 100% logic và interface
 */
const UserTable = ({ users = [], onManageRole, onToggleLock }) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const roleConfig = {
    Admin: {
      color: "#D32F2F",
      bgColor: "#FFEBEE",
      icon: AdminIcon,
      label: "Admin",
      gradient: "linear-gradient(135deg, #D32F2F 0%, #F44336 100%)",
    },
    Moderator: {
      color: "#1976D2",
      bgColor: "#E3F2FD",
      icon: ShieldIcon,
      label: "Moderator",
      gradient: "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
    },
    Author: {
      color: "#388E3C",
      bgColor: "#E8F5E9",
      icon: CreateIcon,
      label: "Author",
      gradient: "linear-gradient(135deg, #388E3C 0%, #66BB6A 100%)",
    },
    User: {
      color: "#757575",
      bgColor: "#F5F5F5",
      icon: PersonIcon,
      label: "User",
      gradient: "linear-gradient(135deg, #757575 0%, #9E9E9E 100%)",
    },
  };

  const statusConfig = {
    active: {
      color: "#10B981",
      bgColor: "#D1FAE5",
      label: "Hoạt động",
      icon: CheckCircleIcon,
    },
    locked: {
      color: "#EF4444",
      bgColor: "#FEE2E2",
      label: "Đã khóa",
      icon: LockIcon,
    },
  };

  const getRoleConfig = (role) => roleConfig[role] || roleConfig.User;
  const getStatusConfig = (status) =>
    statusConfig[status] || statusConfig.active;

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
    } catch (error) {
      return "N/A";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2)
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  if (!users || users.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          gap: 3,
          py: 6,
        }}
      >
        <Box
          sx={{
            width: 120,
            height: 120,
            borderRadius: "24px",
            background: "linear-gradient(135deg, #F0F0F5 0%, #E0E0E8 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PersonIcon sx={{ fontSize: 56, color: "#C4C4D4" }} />
        </Box>
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#1A1A2E",
              mb: 1,
              fontSize: "1.125rem",
            }}
          >
            Không tìm thấy người dùng
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#8E8EA9", fontSize: "0.9375rem" }}
          >
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: "#FAFAFC" }}>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: "#8E8EA9",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                py: 2,
                borderBottom: "1px solid",
                borderColor: "#E0E0E0",
              }}
            >
              Thông tin
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: "#8E8EA9",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                py: 2,
                borderBottom: "1px solid",
                borderColor: "#E0E0E0",
              }}
            >
              Vai trò
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: "#8E8EA9",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                py: 2,
                borderBottom: "1px solid",
                borderColor: "#E0E0E0",
              }}
            >
              Trạng thái
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: "#8E8EA9",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                py: 2,
                borderBottom: "1px solid",
                borderColor: "#E0E0E0",
              }}
            >
              Ngày tham gia
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: "#8E8EA9",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                py: 2,
                borderBottom: "1px solid",
                borderColor: "#E0E0E0",
              }}
            >
              Hành động
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, index) => {
            const role = getRoleConfig(user.role);
            const status = getStatusConfig(user.status);
            const isLocked = user.status === "locked";
            const isHovered = hoveredRow === user._id || hoveredRow === user.id;
            const RoleIcon = role.icon;
            const StatusIcon = status.icon;

            return (
              <Fade in key={user._id || user.id} timeout={300 + index * 50}>
                <TableRow
                  onMouseEnter={() => setHoveredRow(user._id || user.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  sx={{
                    transition: "all 0.2s ease",
                    bgcolor: isHovered ? "#FAFAFC" : "white",
                    "&:hover": { bgcolor: "#FAFAFC" },
                  }}
                >
                  <TableCell
                    sx={{
                      py: 2.5,
                      borderBottom: "1px solid",
                      borderColor: "#F0F0F5",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.name}
                        sx={{
                          width: 44,
                          height: 44,
                          background: role.gradient,
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          boxShadow: `0 4px 14px ${alpha(role.color, 0.3)}`,
                          border: "2px solid white",
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: "#1A1A2E",
                            mb: 0.25,
                            fontSize: "0.9375rem",
                          }}
                        >
                          {user.name}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <EmailIcon sx={{ fontSize: 12, color: "#C4C4D4" }} />
                          <Typography
                            sx={{ color: "#8E8EA9", fontSize: "0.8125rem" }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 2.5,
                      borderBottom: "1px solid",
                      borderColor: "#F0F0F5",
                    }}
                  >
                    <Chip
                      icon={<RoleIcon sx={{ fontSize: "16px !important" }} />}
                      label={role.label}
                      size="small"
                      sx={{
                        bgcolor: role.bgColor,
                        color: role.color,
                        fontWeight: 600,
                        fontSize: "0.8125rem",
                        borderRadius: "8px",
                        "& .MuiChip-icon": { color: role.color },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 2.5,
                      borderBottom: "1px solid",
                      borderColor: "#F0F0F5",
                    }}
                  >
                    <Chip
                      icon={<StatusIcon sx={{ fontSize: "14px !important" }} />}
                      label={status.label}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: status.color,
                        color: status.color,
                        fontWeight: 500,
                        fontSize: "0.8125rem",
                        borderRadius: "8px",
                        bgcolor: alpha(status.color, 0.05),
                        "& .MuiChip-icon": { color: status.color },
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      py: 2.5,
                      borderBottom: "1px solid",
                      borderColor: "#F0F0F5",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 16, color: "#C4C4D4" }} />
                      <Typography
                        variant="body2"
                        sx={{ color: "#4A4A68", fontSize: "0.875rem" }}
                      >
                        {formatDate(user.createdAt)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      py: 2.5,
                      borderBottom: "1px solid",
                      borderColor: "#F0F0F5",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        opacity: isHovered ? 1 : 0.6,
                        transition: "opacity 0.2s ease",
                      }}
                    >
                      <Tooltip title="Phân quyền" arrow>
                        <IconButton
                          size="small"
                          onClick={() => onManageRole && onManageRole(user)}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: alpha("#2196F3", 0.1),
                            color: "#2196F3",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: "#2196F3",
                              color: "white",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          <ManageAccountsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={isLocked ? "Mở khóa" : "Khóa tài khoản"}
                        arrow
                      >
                        <IconButton
                          size="small"
                          onClick={() => onToggleLock && onToggleLock(user)}
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "10px",
                            bgcolor: alpha(
                              isLocked ? "#10B981" : "#EF4444",
                              0.1,
                            ),
                            color: isLocked ? "#10B981" : "#EF4444",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              bgcolor: isLocked ? "#10B981" : "#EF4444",
                              color: "white",
                              transform: "scale(1.1)",
                            },
                          }}
                        >
                          {isLocked ? (
                            <LockOpenIcon fontSize="small" />
                          ) : (
                            <LockIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              </Fade>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
