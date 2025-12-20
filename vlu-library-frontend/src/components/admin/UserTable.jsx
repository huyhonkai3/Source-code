import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import {
  ManageAccounts as ManageAccountsIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { format } from "date-fns";

/**
 * UserTable Component
 * Hiển thị bảng danh sách người dùng với:
 * - Avatar + Tên + Email
 * - Role Badge (Admin/Moderator/Author/User)
 * - Status Badge (Active/Locked)
 * - Ngày tham gia
 * - Actions (Phân quyền / Khóa-Mở khóa)
 *
 * @param {Array} users - Danh sách users
 * @param {Function} onManageRole - Handler khi click nút phân quyền
 * @param {Function} onToggleLock - Handler khi click nút khóa/mở khóa
 */
const UserTable = ({ users = [], onManageRole, onToggleLock }) => {
  /**
   * Get role badge config (color & label)
   */
  const getRoleBadge = (role) => {
    const configs = {
      Admin: { color: "error", label: "Admin" },
      Moderator: { color: "info", label: "Moderator" },
      Author: { color: "success", label: "Author" },
      User: { color: "default", label: "User" },
    };
    return configs[role] || configs.User;
  };

  /**
   * Get status badge config
   */
  const getStatusBadge = (status) => {
    const configs = {
      active: {
        color: "success",
        label: "Hoạt động",
        icon: <CheckCircleIcon fontSize="small" />,
      },
      locked: {
        color: "error",
        label: "Đã khóa",
        icon: <LockIcon fontSize="small" />,
      },
    };
    return configs[status] || configs.active;
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  /**
   * Get initials from name for avatar fallback
   */
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  /**
   * Get avatar background color based on role
   */
  const getAvatarColor = (role) => {
    const colors = {
      Admin: "#D32F2F",
      Moderator: "#1976D2",
      Author: "#388E3C",
      User: "#757575",
    };
    return colors[role] || colors.User;
  };

  // Empty state
  if (!users || users.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 8,
          textAlign: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          Không tìm thấy người dùng nào
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "grey.50",
              "& th": {
                fontWeight: 600,
                color: "text.secondary",
                fontSize: "0.8125rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              },
            }}
          >
            <TableCell>Thông tin</TableCell>
            <TableCell>Vai trò</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Ngày tham gia</TableCell>
            <TableCell align="center">Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => {
            const roleBadge = getRoleBadge(user.role);
            const statusBadge = getStatusBadge(user.status);
            const isLocked = user.status === "locked";

            return (
              <TableRow
                key={user._id || user.id}
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                  transition: "background-color 0.2s",
                }}
              >
                {/* User Info Cell */}
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: getAvatarColor(user.role),
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      {getInitials(user.name)}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          mb: 0.25,
                        }}
                      >
                        {user.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Role Cell */}
                <TableCell>
                  <Chip
                    label={roleBadge.label}
                    color={roleBadge.color}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      height: 24,
                    }}
                  />
                </TableCell>

                {/* Status Cell */}
                <TableCell>
                  <Chip
                    icon={statusBadge.icon}
                    label={statusBadge.label}
                    color={statusBadge.color}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.75rem",
                      height: 24,
                    }}
                  />
                </TableCell>

                {/* Joined Date Cell */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(user.createdAt)}
                  </Typography>
                </TableCell>

                {/* Actions Cell */}
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      justifyContent: "center",
                    }}
                  >
                    {/* Manage Role Button */}
                    <Tooltip title="Phân quyền" arrow>
                      <IconButton
                        size="small"
                        onClick={() => onManageRole && onManageRole(user)}
                        sx={{
                          color: "primary.main",
                          "&:hover": {
                            backgroundColor: "primary.lighter",
                          },
                        }}
                      >
                        <ManageAccountsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {/* Lock/Unlock Button */}
                    <Tooltip
                      title={isLocked ? "Mở khóa" : "Khóa tài khoản"}
                      arrow
                    >
                      <IconButton
                        size="small"
                        onClick={() => onToggleLock && onToggleLock(user)}
                        sx={{
                          color: isLocked ? "success.main" : "error.main",
                          "&:hover": {
                            backgroundColor: isLocked
                              ? "success.lighter"
                              : "error.lighter",
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
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default UserTable;
