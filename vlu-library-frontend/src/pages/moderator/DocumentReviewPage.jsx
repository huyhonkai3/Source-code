// Trang Kiểm duyệt Tài liệu (F7 / Moderator)
// API: 2.6 (PUT /api/admin/documents/:id/status)
// API: 2.8 (GET /api/admin/documents?status=pending)

import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Alert,
    CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import axios from "axios";

const ReviewDocuments = () => {
    // ======================== STATE MANAGEMENT ========================
    const [activeTab, setActiveTab] = useState(0); // 0: pending, 1: approved, 2: rejected
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalDocuments: 0,
    });

    // Dialog state
    const [approveDialog, setApproveDialog] = useState({
        open: false,
        documentId: null,
        documentTitle: "",
    });
    const [rejectDialog, setRejectDialog] = useState({
        open: false,
        documentId: null,
        documentTitle: "",
        reason: "",
    });

    // ======================== TAB MAPPING ========================
    const statusMap = ["pending", "approved", "rejected"];
    const currentStatus = statusMap[activeTab];

    // ======================== API CALLS ========================
    const fetchDocuments = async (status = "pending", page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `http://localhost:5000/api/admin/documents`,
                {
                    params: {
                        status,
                        page,
                        limit: 10,
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.data.status === "success") {
                setDocuments(response.data.data.documents);
                setPagination(response.data.data.pagination);
            }
        } catch (err) {
            console.error("Fetch documents error:", err);
            setError(
                err.response?.data?.message || "Lỗi khi tải danh sách tài liệu"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleApproveDocument = async () => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/documents/${approveDialog.documentId}/status`,
                {
                    status: "approved",
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.data.status === "success") {
                setSuccess("Duyệt tài liệu thành công!");
                setApproveDialog({ open: false, documentId: null, documentTitle: "" });
                // Reload danh sách
                fetchDocuments(currentStatus, pagination.currentPage);
            }
        } catch (err) {
            console.error("Approve document error:", err);
            setError(err.response?.data?.message || "Lỗi khi duyệt tài liệu");
        }
    };

    const handleRejectDocument = async () => {
        if (!rejectDialog.reason.trim()) {
            setError("Vui lòng nhập lý do từ chối");
            return;
        }

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/admin/documents/${rejectDialog.documentId}/status`,
                {
                    status: "rejected",
                    reason: rejectDialog.reason,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            );

            if (response.data.status === "success") {
                setSuccess("Từ chối tài liệu thành công!");
                setRejectDialog({
                    open: false,
                    documentId: null,
                    documentTitle: "",
                    reason: "",
                });
                // Reload danh sách
                fetchDocuments(currentStatus, pagination.currentPage);
            }
        } catch (err) {
            console.error("Reject document error:", err);
            setError(err.response?.data?.message || "Lỗi khi từ chối tài liệu");
        }
    };

    // ======================== EFFECTS ========================
    useEffect(() => {
        fetchDocuments(currentStatus, 1);
    }, [activeTab]);

    // ======================== EVENT HANDLERS ========================
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        setPagination({ currentPage: 1, totalPages: 1, totalDocuments: 0 });
    };

    const handlePageChange = (event, newPage) => {
        fetchDocuments(currentStatus, newPage);
    };

    const openApproveDialog = (doc) => {
        setApproveDialog({
            open: true,
            documentId: doc.id,
            documentTitle: doc.title,
        });
    };

    const openRejectDialog = (doc) => {
        setRejectDialog({
            open: true,
            documentId: doc.id,
            documentTitle: doc.title,
            reason: "",
        });
    };

    // ======================== HELPER FUNCTIONS ========================
    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    };

    // ======================== RENDER ========================
    return (
        <Box className="p-8 bg-gray-100 min-h-screen">
            {/* Success/Error Alerts */}
            {success && (
                <Alert
                    severity="success"
                    onClose={() => setSuccess(null)}
                    className="mb-4"
                >
                    {success}
                </Alert>
            )}
            {error && (
                <Alert severity="error" onClose={() => setError(null)} className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Main Card */}
            <Card className="bg-white rounded-xl shadow-lg p-8 w-full">
                {/* Header */}
                <Typography
                    variant="h5"
                    className="font-bold text-gray-900 mb-6"
                    gutterBottom
                >
                    DANH SÁCH CHỜ DUYỆT
                </Typography>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    className="mb-6 border-b border-gray-200"
                    TabIndicatorProps={{
                        style: { backgroundColor: "#b91c1c" },
                    }}
                >
                    <Tab
                        label={`Chờ duyệt ${
                            activeTab === 0 ? `(${pagination.totalDocuments})` : ""
                        }`}
                        className="font-semibold"
                    />
                    <Tab
                        label={`Đã duyệt ${
                            activeTab === 1 ? `(${pagination.totalDocuments})` : ""
                        }`}
                        className="font-semibold"
                    />
                    <Tab
                        label={`Bị từ chối ${
                            activeTab === 2 ? `(${pagination.totalDocuments})` : ""
                        }`}
                        className="font-semibold"
                    />
                </Tabs>

                {/* Loading State */}
                {loading && (
                    <Box className="flex justify-center items-center py-12">
                        <CircularProgress color="error" />
                    </Box>
                )}

                {/* Table */}
                {!loading && (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow className="bg-gray-50">
                                    <TableCell className="font-bold">Tiêu đề</TableCell>
                                    <TableCell className="font-bold">
                                        Người tải lên
                                    </TableCell>
                                    <TableCell className="font-bold">Danh mục</TableCell>
                                    <TableCell className="font-bold">Ngày tải</TableCell>
                                    <TableCell className="font-bold">
                                        Kích thước
                                    </TableCell>
                                    {activeTab === 0 && (
                                        <TableCell className="font-bold" align="center">
                                            Hành động
                                        </TableCell>
                                    )}
                                    {activeTab === 2 && (
                                        <TableCell className="font-bold">
                                            Lý do từ chối
                                        </TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {documents.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={activeTab === 0 ? 6 : 5}
                                            align="center"
                                            className="py-12 text-gray-500"
                                        >
                                            Không có tài liệu nào
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    documents.map((doc) => (
                                        <TableRow
                                            key={doc.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <TableCell>
                                                <Typography
                                                    variant="body2"
                                                    className="font-medium"
                                                >
                                                    {doc.title}
                                                </Typography>
                                                {doc.author && (
                                                    <Typography
                                                        variant="caption"
                                                        className="text-gray-500"
                                                    >
                                                        Tác giả: {doc.author}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {doc.uploadedBy?.name || "N/A"}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    className="text-gray-500"
                                                >
                                                    {doc.uploadedBy?.email || ""}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={doc.category?.name || "N/A"}
                                                    size="small"
                                                    className="bg-red-50 text-red-700"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(doc.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                {formatFileSize(doc.fileSize)}
                                            </TableCell>
                                            {activeTab === 0 && (
                                                <TableCell align="center">
                                                    <Box className="flex gap-2 justify-center">
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            size="small"
                                                            startIcon={<CheckCircleIcon />}
                                                            onClick={() =>
                                                                openApproveDialog(doc)
                                                            }
                                                            className="rounded-lg"
                                                        >
                                                            Duyệt
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            size="small"
                                                            startIcon={<CancelIcon />}
                                                            onClick={() =>
                                                                openRejectDialog(doc)
                                                            }
                                                            className="rounded-lg"
                                                        >
                                                            Từ chối
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            )}
                                            {activeTab === 2 && (
                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        className="text-red-600"
                                                    >
                                                        {doc.rejectionReason || "N/A"}
                                                    </Typography>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Pagination */}
                {!loading && pagination.totalPages > 1 && (
                    <Box className="flex justify-center mt-6">
                        <Pagination
                            count={pagination.totalPages}
                            page={pagination.currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                        />
                    </Box>
                )}
            </Card>

            {/* Approve Dialog */}
            <Dialog
                open={approveDialog.open}
                onClose={() =>
                    setApproveDialog({ open: false, documentId: null, documentTitle: "" })
                }
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="font-bold">Xác nhận duyệt tài liệu</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc muốn duyệt tài liệu{" "}
                        <strong>"{approveDialog.documentTitle}"</strong>?
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mt-2">
                        Sau khi duyệt, tài liệu sẽ hiển thị công khai cho người dùng.
                    </Typography>
                </DialogContent>
                <DialogActions className="p-4">
                    <Button
                        onClick={() =>
                            setApproveDialog({
                                open: false,
                                documentId: null,
                                documentTitle: "",
                            })
                        }
                        className="rounded-lg"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleApproveDocument}
                        className="rounded-lg"
                    >
                        Xác nhận duyệt
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog
                open={rejectDialog.open}
                onClose={() =>
                    setRejectDialog({
                        open: false,
                        documentId: null,
                        documentTitle: "",
                        reason: "",
                    })
                }
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle className="font-bold">Từ chối tài liệu</DialogTitle>
                <DialogContent>
                    <Typography className="mb-4">
                        Từ chối tài liệu <strong>"{rejectDialog.documentTitle}"</strong>
                    </Typography>
                    <TextField
                        label="Lý do từ chối (bắt buộc)"
                        multiline
                        rows={4}
                        fullWidth
                        required
                        variant="outlined"
                        value={rejectDialog.reason}
                        onChange={(e) =>
                            setRejectDialog({ ...rejectDialog, reason: e.target.value })
                        }
                        helperText="Vui lòng nhập lý do cụ thể để tác giả biết cách cải thiện"
                    />
                </DialogContent>
                <DialogActions className="p-4">
                    <Button
                        onClick={() =>
                            setRejectDialog({
                                open: false,
                                documentId: null,
                                documentTitle: "",
                                reason: "",
                            })
                        }
                        className="rounded-lg"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleRejectDocument}
                        disabled={!rejectDialog.reason.trim()}
                        className="rounded-lg"
                    >
                        Xác nhận từ chối
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ReviewDocuments;