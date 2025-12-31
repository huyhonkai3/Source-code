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
  alpha,
  Skeleton,
  Fade,
} from "@mui/material";
import {
  FolderOpen as FolderOpenIcon,
  Inbox as InboxIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import ModerationRow from "./ModerationRow";

/**
 * ModerationTable Component - VLU Design System v2.0.1
 * UPDATED: Tăng font sizes để UX tốt hơn
 */
const ModerationTable = ({
  documents = [],
  loading = false,
  page = 1,
  totalPages = 1,
  totalDocuments = 0,
  currentTab = 0,
  onPageChange,
  onReview,
}) => {
  const getHeaders = () => {
    const baseHeaders = [
      { id: "document", label: "TÀI LIỆU", align: "left", width: "35%" },
      { id: "author", label: "TÁC GIẢ", align: "left", width: "20%" },
      { id: "category", label: "DANH MỤC", align: "left", width: "15%" },
      { id: "time", label: "THỜI GIAN", align: "left", width: "15%" },
    ];

    if (currentTab === 0) {
      baseHeaders.push({
        id: "action",
        label: "HÀNH ĐỘNG",
        align: "center",
        width: "15%",
      });
    } else {
      baseHeaders.push({
        id: "reviewer",
        label: "NGƯỜI DUYỆT",
        align: "left",
        width: "15%",
      });
    }

    return baseHeaders;
  };

  const headers = getHeaders();

  const SkeletonRow = ({ index }) => (
    <TableRow
      sx={{
        animation: `fadeIn 0.3s ease ${index * 0.05}s both`,
        "@keyframes fadeIn": { from: { opacity: 0 }, to: { opacity: 1 } },
      }}
    >
      <TableCell>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Skeleton
            variant="rounded"
            width={48}
            height={48}
            sx={{ borderRadius: "12px" }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="40%" height={18} />
          </Box>
        </Box>
      </TableCell>
      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" width={100} />
        </Box>
      </TableCell>
      <TableCell>
        <Skeleton
          variant="rounded"
          width={100}
          height={28}
          sx={{ borderRadius: "8px" }}
        />
      </TableCell>
      <TableCell>
        <Skeleton variant="text" width={80} />
      </TableCell>
      <TableCell align="center">
        <Skeleton
          variant="rounded"
          width={100}
          height={36}
          sx={{ borderRadius: "10px", mx: "auto" }}
        />
      </TableCell>
    </TableRow>
  );

  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#FAFAFC" }}>
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  align={header.align}
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
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <SkeletonRow key={index} index={index} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (!documents || documents.length === 0) {
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
            position: "relative",
          }}
        >
          <InboxIcon sx={{ fontSize: 56, color: "#C4C4D4" }} />
          <Box
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              width: 24,
              height: 24,
              borderRadius: "8px",
              bgcolor: "#FFC107",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DocumentIcon sx={{ fontSize: 14, color: "white" }} />
          </Box>
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
            {currentTab === 0
              ? "Không có tài liệu chờ duyệt"
              : currentTab === 1
                ? "Chưa có tài liệu nào được duyệt"
                : "Chưa có tài liệu nào bị từ chối"}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#8E8EA9", maxWidth: 300, fontSize: "0.9375rem" }}
          >
            {currentTab === 0
              ? "Tất cả tài liệu đã được xử lý. Kiểm tra lại sau nhé!"
              : "Các tài liệu sẽ xuất hiện ở đây sau khi được xử lý"}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "#FAFAFC" }}>
              {headers.map((header) => (
                <TableCell
                  key={header.id}
                  align={header.align}
                  width={header.width}
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
                  {header.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((document, index) => (
              <Fade
                in
                key={document._id || document.id}
                timeout={300 + index * 50}
              >
                <TableRow
                  sx={{
                    animation: `slideIn 0.3s ease ${index * 0.05}s both`,
                    "@keyframes slideIn": {
                      from: { opacity: 0, transform: "translateY(10px)" },
                      to: { opacity: 1, transform: "translateY(0)" },
                    },
                  }}
                >
                  <ModerationRow
                    document={document}
                    currentTab={currentTab}
                    onReview={onReview}
                  />
                </TableRow>
              </Fade>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 3,
            borderTop: "1px solid",
            borderColor: "#E0E0E0",
            bgcolor: "#FAFAFC",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "#4A4A68", fontWeight: 500, fontSize: "0.9375rem" }}
          >
            Hiển thị{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
              {documents.length}
            </Box>{" "}
            trong số{" "}
            <Box component="span" sx={{ fontWeight: 700, color: "#1A1A2E" }}>
              {totalDocuments}
            </Box>{" "}
            tài liệu
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => onPageChange(value)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            sx={{
              "& .MuiPaginationItem-root": {
                fontWeight: 600,
                borderRadius: "10px",
                minWidth: 40,
                height: 40,
                fontSize: "0.9375rem",
                "&:hover": { bgcolor: alpha("#D32F2F", 0.08) },
                "&.Mui-selected": {
                  bgcolor: "#D32F2F",
                  color: "white",
                  "&:hover": { bgcolor: "#B71C1C" },
                },
              },
              "& .MuiPaginationItem-previousNext, & .MuiPaginationItem-firstLast":
                {
                  borderRadius: "10px",
                  bgcolor: "#F0F0F5",
                  "&:hover": { bgcolor: "#E0E0E8" },
                },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ModerationTable;
