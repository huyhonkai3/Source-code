import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { FolderOpen as FolderOpenIcon } from "@mui/icons-material";
import ModerationRow from "./ModerationRow";

/**
 * ModerationTable Component
 * Bảng hiển thị danh sách tài liệu cần kiểm duyệt
 *
 * @param {Array} documents - Danh sách tài liệu
 * @param {boolean} loading - Trạng thái đang tải
 * @param {number} page - Trang hiện tại
 * @param {number} totalPages - Tổng số trang
 * @param {Function} onPageChange - Callback khi đổi trang
 * @param {Function} onReview - Callback khi click "Xem xét"
 */
const ModerationTable = ({
  documents = [],
  loading = false,
  page = 1,
  totalPages = 1,
  totalDocuments = 0,
  currentTab = 0, // 0: pending, 1: approved, 2: rejected
  onPageChange,
  onReview,
}) => {
  /**
   * Table headers - Dynamic based on tab
   */
  const getHeaders = () => {
    const baseHeaders = [
      { id: "document", label: "TÀI LIỆU", align: "left" },
      { id: "author", label: "TÁC GIẢ", align: "left" },
      { id: "category", label: "DANH MỤC", align: "left" },
      { id: "time", label: "THỜI GIAN GỬI", align: "left" },
    ];

    // Change last column based on tab
    if (currentTab === 0) {
      // Pending tab - Show action button
      baseHeaders.push({ id: "action", label: "HÀNH ĐỘNG", align: "center" });
    } else {
      // Approved/Rejected tabs - Show reviewer
      baseHeaders.push({
        id: "reviewer",
        label: "NGƯỜI THỰC HIỆN",
        align: "left",
      });
    }

    return baseHeaders;
  };

  const headers = getHeaders();

  /**
   * Loading state
   */
  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  /**
   * Empty state
   */
  if (!documents || documents.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 400,
            gap: 2,
          }}
        >
          <FolderOpenIcon
            sx={{
              fontSize: 64,
              color: "text.disabled",
            }}
          />
          <Typography variant="h6" color="text.secondary">
            Không có tài liệu nào
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Chưa có tài liệu nào trong danh mục này
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Table */}
      <TableContainer>
        <Table>
          {/* Table Head */}
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "grey.50",
              }}
            >
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  align={header.align}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    py: 2,
                  }}
                >
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {documents.map((document) => (
              <ModerationRow
                key={document._id || document.id}
                document={document}
                currentTab={currentTab}
                onReview={onReview}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Hiển thị {documents.length} trong số {totalDocuments} tài liệu
          </Typography>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => onPageChange(value)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Paper>
  );
};

export default ModerationTable;
