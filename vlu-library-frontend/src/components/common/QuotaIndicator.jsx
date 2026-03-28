// Component hiển thị trạng thái lượt tải và tiến độ upload của user.
// Đặt vào Sidebar hoặc Header để user luôn nhìn thấy.
// Chỉ hiển thị với Role User/Author — ẩn với Admin/Moderator.
import { useAuth } from "../../context/AuthContext";
import { Upload, Download } from "lucide-react";

function QuotaIndicator() {
  const { user, downloadAllowance, uploadCycleCount } = useAuth();

  // Ẩn hoàn toàn với Admin/Moderator (họ được miễn quota)
  if (!user || ["Admin", "Moderator"].includes(user.role)) {
    return null;
  }

  const isLow = downloadAllowance <= 2 && downloadAllowance > 0;
  const isEmpty = downloadAllowance === 0;
  const progress = (uploadCycleCount / 3) * 100;

  return (
    <div
      style={{
        margin: "0.5rem 0.75rem",
        padding: "0.75rem",
        backgroundColor: isEmpty
          ? "rgba(139, 74, 58, 0.08)" // expense-bg đỏ nhạt khi hết lượt
          : isLow
            ? "rgba(212, 168, 67, 0.08)" // gold-bg vàng nhạt khi sắp hết
            : "var(--color-bg-subtle, #F4F2EE)",
        border: `1px solid ${
          isEmpty
            ? "rgba(139, 74, 58, 0.2)"
            : isLow
              ? "rgba(212, 168, 67, 0.3)"
              : "var(--color-border, #E8E4DD)"
        }`,
        borderRadius: "0.625rem",
      }}
    >
      {/* Row 1: Lượt tải còn lại */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <Download
            size={13}
            style={{
              color: isEmpty
                ? "var(--color-expense, #8B4A3A)"
                : isLow
                  ? "var(--color-gold, #D4A843)"
                  : "var(--color-ink-2, #6B6860)",
            }}
          />
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 500,
              color: isEmpty
                ? "var(--color-expense, #8B4A3A)"
                : "var(--color-ink-2, #6B6860)",
            }}
          >
            Lượt tải
          </span>
        </div>
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            fontFamily: "var(--font-mono, monospace)",
            color: isEmpty
              ? "var(--color-expense, #8B4A3A)"
              : isLow
                ? "var(--color-gold, #D4A843)"
                : "var(--color-ink, #1A1A1A)",
            backgroundColor: isEmpty
              ? "rgba(139, 74, 58, 0.1)"
              : isLow
                ? "rgba(212, 168, 67, 0.12)"
                : "var(--color-bg-card, #FFF)",
            padding: "1px 6px",
            borderRadius: "4px",
          }}
        >
          {downloadAllowance}
        </span>
      </div>

      {/* Row 2: Tiến độ upload (chỉ hiện khi hết hoặc sắp hết lượt) */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.3125rem",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Upload
              size={11}
              style={{ color: "var(--color-ink-3, #A8A49E)" }}
            />
            <span
              style={{
                fontSize: "0.625rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-ink-3, #A8A49E)",
              }}
            >
              Tiến độ up
            </span>
          </div>
          <span
            style={{
              fontSize: "0.625rem",
              fontWeight: 600,
              color:
                uploadCycleCount > 0
                  ? "var(--color-gold, #D4A843)"
                  : "var(--color-ink-3, #A8A49E)",
              fontFamily: "var(--font-mono, monospace)",
            }}
          >
            {uploadCycleCount}/3
          </span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: "3px",
            backgroundColor: "var(--color-border, #E8E4DD)",
            borderRadius: "9999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor:
                uploadCycleCount > 0
                  ? "var(--color-gold, #D4A843)"
                  : "transparent",
              borderRadius: "9999px",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Message khi hết lượt */}
        {isEmpty && (
          <p
            style={{
              fontSize: "0.625rem",
              color: "var(--color-expense, #8B4A3A)",
              marginTop: "0.375rem",
              lineHeight: 1.4,
            }}
          >
            Upload {3 - uploadCycleCount} tài liệu nữa → +5 lượt tải
          </p>
        )}
      </div>
    </div>
  );
}

export default QuotaIndicator;
