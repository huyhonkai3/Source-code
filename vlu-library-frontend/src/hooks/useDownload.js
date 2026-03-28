import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginRequiredDialog from "../components/common/LoginRequiredDialog";
import DownloadDialog from "../components/documents/DownloadDialog";

/**
 * useDownload Hook
 *
 * FIX: Parse Blob error response trước khi kiểm tra QUOTA_EXCEEDED.
 *
 * Root cause của bug "Tải xuống thất bại" dù quota chưa hết:
 * - axios download request dùng responseType: 'blob' để stream file binary.
 * - Khi backend trả 403 JSON (QUOTA_EXCEEDED), axios vẫn deserialize body
 *   thành Blob thay vì object, vì responseType đã được set cứng là 'blob'.
 * - error.response.data là Blob → error.response.data.message = undefined
 * - handleDownloadError không nhận ra QUOTA_EXCEEDED → rơi vào nhánh else
 *   → hiện lỗi generic "Không thể tải xuống tài liệu".
 *
 * Fix: Thêm hàm parseErrorResponse() parse Blob → JSON trước khi đọc message.
 */
const useDownload = () => {
  const { isAuthenticated, updateQuota } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [quotaError, setQuotaError] = useState(null);

  const handleDownload = (document) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }
    setSelectedDocument(document);
    setDownloadDialogOpen(true);
  };

  /**
   * Parse error response — xử lý cả JSON object lẫn Blob.
   *
   * Khi axios dùng responseType: 'blob', error body luôn là Blob kể cả
   * khi server trả JSON. Cần đọc Blob bằng FileReader / blob.text() trước.
   *
   * @param {AxiosError} error
   * @returns {Promise<Object>} Parsed response data object (hoặc {} nếu parse thất bại)
   */
  const parseErrorResponse = async (error) => {
    const data = error?.response?.data;
    if (!data) return {};

    // Nếu đã là object (responseType không phải blob, hoặc interceptor đã parse)
    if (typeof data === "object" && !(data instanceof Blob)) {
      return data;
    }

    // Nếu là Blob — parse sang text rồi JSON
    if (data instanceof Blob) {
      try {
        const text = await data.text();
        return JSON.parse(text);
      } catch {
        return {};
      }
    }

    return {};
  };

  /**
   * Handle lỗi download từ DownloadDialog.
   * Async vì cần await parseErrorResponse() để đọc Blob.
   *
   * @param {AxiosError} error
   */
  const handleDownloadError = async (error) => {
    const status = error?.response?.status;

    // Parse response body — hoạt động đúng dù data là Blob hay JSON object
    const responseData = await parseErrorResponse(error);

    if (status === 403 && responseData?.message === "QUOTA_EXCEEDED") {
      const currentCycle = responseData?.currentCycle ?? 0;
      const needed = responseData?.needed ?? 3 - currentCycle;

      // Sync quota state vào AuthContext để QuotaIndicator cập nhật ngay
      updateQuota(0, currentCycle);

      setQuotaError({
        currentCycle,
        needed,
        message:
          `Bạn đã hết lượt tải. ` +
          `Bạn đang có ${currentCycle}/3 tài liệu tải lên trong vòng hiện tại. ` +
          `Vui lòng upload thêm ${needed} tài liệu nữa để nhận 5 lượt tải mới.`,
      });

      setDownloadDialogOpen(false);
      setSelectedDocument(null);
    } else {
      // Lỗi 403 thông thường hoặc lỗi khác — để DownloadDialog tự xử lý
      console.error("[useDownload] Download error:", error);
    }
  };

  const dismissQuotaError = () => setQuotaError(null);
  const handleCloseLoginDialog = () => setLoginDialogOpen(false);
  const handleCloseDownloadDialog = () => {
    setDownloadDialogOpen(false);
    setSelectedDocument(null);
  };

  const DownloadUI = (
    <>
      <LoginRequiredDialog
        open={loginDialogOpen}
        onClose={handleCloseLoginDialog}
        action="tải tài liệu"
      />

      <DownloadDialog
        open={downloadDialogOpen}
        onClose={handleCloseDownloadDialog}
        document={selectedDocument}
        onError={handleDownloadError}
      />

      {quotaError && (
        <QuotaExceededAlert
          message={quotaError.message}
          currentCycle={quotaError.currentCycle}
          onDismiss={dismissQuotaError}
        />
      )}
    </>
  );

  return {
    handleDownload,
    handleDownloadError,
    DownloadUI,
    quotaError,
    dismissQuotaError,
  };
};

// ─── QuotaExceededAlert ────────────────────────────────────────────────────
const QuotaExceededAlert = ({ message, currentCycle, onDismiss }) => (
  <div
    style={{
      position: "fixed",
      bottom: "1.5rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      maxWidth: "480px",
      width: "calc(100% - 2rem)",
      backgroundColor: "#FFFBEB",
      border: "1px solid #F59E0B",
      borderRadius: "0.75rem",
      padding: "1rem 1.25rem",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
      animation: "slideUp 0.3s ease",
    }}
    role="alert"
  >
    <span style={{ fontSize: "1.25rem", lineHeight: 1, flexShrink: 0 }}>
      📤
    </span>

    <div style={{ flex: 1, minWidth: 0 }}>
      <p
        style={{
          fontWeight: 600,
          fontSize: "0.9375rem",
          color: "#92400E",
          marginBottom: "0.25rem",
        }}
      >
        Hết lượt tải xuống
      </p>
      <p style={{ fontSize: "0.875rem", color: "#B45309", lineHeight: 1.5 }}>
        {message}
      </p>

      <div style={{ marginTop: "0.625rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "#B45309",
            marginBottom: "0.25rem",
          }}
        >
          <span>Tiến độ upload</span>
          <span style={{ fontWeight: 600 }}>{currentCycle}/3</span>
        </div>
        <div
          style={{
            height: "4px",
            backgroundColor: "#FDE68A",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(currentCycle / 3) * 100}%`,
              backgroundColor: "#F59E0B",
              borderRadius: "9999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>
    </div>

    <button
      onClick={onDismiss}
      aria-label="Đóng thông báo"
      style={{
        flexShrink: 0,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        color: "#B45309",
        fontSize: "1.125rem",
        lineHeight: 1,
        padding: "0.125rem",
        borderRadius: "4px",
      }}
    >
      ×
    </button>

    <style>{`
      @keyframes slideUp {
        from { opacity: 0; transform: translateX(-50%) translateY(12px); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
    `}</style>
  </div>
);

export default useDownload;
