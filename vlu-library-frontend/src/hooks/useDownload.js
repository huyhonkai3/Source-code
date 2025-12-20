import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginRequiredDialog from "../components/common/LoginRequiredDialog";
import DownloadDialog from "../components/documents/DownloadDialog";

/**
 * useDownload Hook
 * Custom hook để xử lý logic download tài liệu
 * Tái sử dụng cho DocumentDetailPage và DocumentCard
 *
 * @returns {Object} { handleDownload, DownloadUI }
 */
const useDownload = () => {
  const { isAuthenticated } = useAuth();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  /**
   * Handle download button click
   * @param {Object} document - Document object to download
   */
  const handleDownload = (document) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true);
      return;
    }

    setSelectedDocument(document);
    setDownloadDialogOpen(true);
  };

  /**
   * Close login dialog
   */
  const handleCloseLoginDialog = () => {
    setLoginDialogOpen(false);
  };

  /**
   * Close download dialog
   */
  const handleCloseDownloadDialog = () => {
    setDownloadDialogOpen(false);
    setSelectedDocument(null);
  };

  /**
   * Download UI Components
   * Render both dialogs
   */
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
      />
    </>
  );

  return {
    handleDownload,
    DownloadUI,
  };
};

export default useDownload;
