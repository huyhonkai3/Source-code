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
  Divider,
  alpha,
} from "@mui/material";
import {
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Gavel as GavelIcon,
  OpenInNew as OpenInNewIcon,
  AssignmentInd as OwnCreationIcon,
  PublicOutlined as PublicDomainIcon,
  HandshakeOutlined as ThirdPartyIcon,
  VerifiedUser as VerifiedIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

// ==================== COPYRIGHT HELPERS ====================

const COPYRIGHT_TYPE_CONFIG = {
  OWN_CREATION: {
    label: "Tác phẩm gốc",
    color: "#4CAF50",
    bgcolor: alpha("#4CAF50", 0.08),
    borderColor: alpha("#4CAF50", 0.25),
    Icon: OwnCreationIcon,
  },
  PUBLIC_DOMAIN: {
    label: "Phạm vi công cộng / Mã nguồn mở",
    color: "#2196F3",
    bgcolor: alpha("#2196F3", 0.08),
    borderColor: alpha("#2196F3", 0.25),
    Icon: PublicDomainIcon,
  },
  THIRD_PARTY_AUTHORIZED: {
    label: "Được ủy quyền bởi bên thứ 3",
    color: "#FF9800",
    bgcolor: alpha("#FF9800", 0.08),
    borderColor: alpha("#FF9800", 0.35),
    Icon: ThirdPartyIcon,
  },
};

/**
 * ReviewPanel Component - [UPDATED v2: Copyright info + Authorization file viewer]
 *
 * @param {Object} document - Document data
 * @param {Function} onApprove - Callback khi duyệt
 * @param {Function} onReject - Callback khi từ chối
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
  const categoryName =
    document.category?.name ||
    document.categoryId?.name ||
    document.category ||
    "N/A";
  const publishYear = document.publishYear || "N/A";
  const tags = document.keywords || document.tags || [];
  const tagArray = Array.isArray(tags) ? tags : [];

  // [NEW] Copyright info
  const copyrightType = document.copyrightType || "OWN_CREATION";
  const copyrightConfig =
    COPYRIGHT_TYPE_CONFIG[copyrightType] || COPYRIGHT_TYPE_CONFIG.OWN_CREATION;
  const CopyrightIcon = copyrightConfig.Icon;
  const authorizationFileUrl = document.authorizationFileUrl;
  const isTosAccepted = document.isTosAccepted !== false; // default true

  /**
   * Xử lý xem file giấy ủy quyền
   */
  const handleViewAuthorizationFile = () => {
    if (!authorizationFileUrl) return;
    // Build full URL nếu là path local
    const fullUrl = authorizationFileUrl.startsWith("http")
      ? authorizationFileUrl
      : `${process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000"}${authorizationFileUrl}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

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
      {/* ========== USER INFO CARD ========== */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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

      {/* ========== DOCUMENT INFO FORM ========== */}
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
            InputProps={{ readOnly: true }}
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
              InputProps={{ readOnly: true }}
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
              InputProps={{ readOnly: true }}
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
            InputProps={{ readOnly: true }}
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

        {/* ========== [NEW] THÔNG TIN BẢN QUYỀN ========== */}
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <GavelIcon sx={{ fontSize: 18, color: "#7C4DFF" }} />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              textTransform: "uppercase",
              color: "#7C4DFF",
              letterSpacing: "0.08em",
            }}
          >
            Thông tin bản quyền
          </Typography>
        </Box>

        {/* Copyright Type Badge */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: "12px",
            bgcolor: copyrightConfig.bgcolor,
            border: "1px solid",
            borderColor: copyrightConfig.borderColor,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                bgcolor: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CopyrightIcon
                sx={{ fontSize: 20, color: copyrightConfig.color }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="caption"
                sx={{ color: "#8E8EA9", display: "block" }}
              >
                Loại bản quyền
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: copyrightConfig.color }}
              >
                {copyrightConfig.label}
              </Typography>
            </Box>
            {isTosAccepted && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <VerifiedIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
                <Typography
                  variant="caption"
                  sx={{ color: "#4CAF50", fontWeight: 600 }}
                >
                  Đã đồng ý ToS
                </Typography>
              </Box>
            )}
          </Box>

          {/* Cam đoan tác giả */}
          {copyrightType === "OWN_CREATION" && document.authorDeclaration && (
            <Box
              sx={{
                mt: 1.5,
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: alpha("#4CAF50", 0.2),
                display: "flex",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <CheckIcon sx={{ fontSize: 16, color: "#4CAF50" }} />
              <Typography variant="caption" sx={{ color: "#2E7D32" }}>
                Đã cam đoan là tác giả gốc
              </Typography>
            </Box>
          )}
        </Paper>

        {/* [NEW] Authorization File Viewer - Chỉ hiển thị khi THIRD_PARTY_AUTHORIZED */}
        {copyrightType === "THIRD_PARTY_AUTHORIZED" && (
          <Box sx={{ mb: 3 }}>
            {authorizationFileUrl ? (
              <Button
                variant="outlined"
                fullWidth
                startIcon={<OpenInNewIcon />}
                onClick={handleViewAuthorizationFile}
                sx={{
                  borderRadius: "10px",
                  borderColor: "#FF9800",
                  color: "#E65100",
                  fontWeight: 600,
                  textTransform: "none",
                  py: 1,
                  "&:hover": {
                    borderColor: "#E65100",
                    bgcolor: alpha("#FF9800", 0.05),
                  },
                }}
              >
                Xem Giấy ủy quyền / Minh chứng bản quyền
              </Button>
            ) : (
              <Alert
                severity="warning"
                icon={<WarningIcon />}
                sx={{ borderRadius: "10px" }}
              >
                <Typography variant="body2" fontWeight={600}>
                  Thiếu giấy ủy quyền!
                </Typography>
                <Typography variant="caption">
                  Tài liệu bên thứ 3 cần có file giấy ủy quyền hợp lệ. Hãy xem
                  xét từ chối với lý do "Thiếu giấy ủy quyền hợp lệ".
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* ========== SYSTEM CHECK BOX ========== */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            backgroundColor: "#E8F5E9",
            border: "1px solid #81C784",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <SecurityIcon sx={{ color: "success.main" }} />
            <Typography variant="subtitle2" fontWeight={700}>
              KIỂM TRA HỆ THỐNG
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {[
              "Không phát hiện virus/malware",
              "Định dạng file hợp lệ",
              "Kích thước tệp trong giới hạn cho phép",
            ].map((check) => (
              <Box
                key={check}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CheckIcon sx={{ color: "success.main", fontSize: 20 }} />
                <Typography variant="body2">{check}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* ========== ACTION BUTTONS ========== */}
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
            sx={{ py: 1.5, fontWeight: 600 }}
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
            sx={{ py: 1.5, fontWeight: 600 }}
          >
            Duyệt & Công khai
          </Button>
        </Box>

        {/* Gợi ý từ chối nhanh khi thiếu giấy ủy quyền */}
        {copyrightType === "THIRD_PARTY_AUTHORIZED" &&
          !authorizationFileUrl && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                Gợi ý lý do từ chối nhanh:{" "}
                <strong>
                  "Tài liệu bên thứ 3 thiếu giấy ủy quyền hợp lệ từ chủ sở hữu
                  bản quyền."
                </strong>
              </Typography>
            </Alert>
          )}

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
