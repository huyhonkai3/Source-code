import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    Snackbar,
    Box,
    CircularProgress,
    Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import apiClient from "../../api/axiosConfig";

// Styled components
const GridContainer = styled(Box)(({ theme }) => ({
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
    [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '2fr 3fr', // 40% và 60%
    },
}));

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: '#f9fafb',
    },
    transition: 'background-color 0.2s',
}));

const CategoryManagerPage = () => {
    const [categories, setCategories] = useState([]);
    const [formValues, setFormValues] = useState({
        name: "",
        description: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState("");
    const [tableError, setTableError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const fetchCategories = async () => {
        setTableLoading(true);
        setTableError("");
        try {
            const response = await apiClient.get("/api/categories");
            const data = response.data?.data;
            setCategories(data?.categories || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setTableError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
        } finally {
            setTableLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setFormValues({ name: "", description: "" });
        setIsEditing(false);
        setCurrentCategoryId(null);
        setError("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditClick = (category) => {
        setIsEditing(true);
        setCurrentCategoryId(category.id || category._id);
        setFormValues({
            name: category.name || "",
            description: category.description || "",
        });
        setError("");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const openDeleteDialog = (category) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setCategoryToDelete(null);
    };

    const handleDeleteConfirmed = async () => {
        if (!categoryToDelete) return;

        const id = categoryToDelete.id || categoryToDelete._id;
        setTableError("");
        try {
            await apiClient.delete(`/api/admin/categories/${id}`);
            setCategories((prev) => prev.filter((c) => (c.id || c._id) !== id));
            setSuccessMessage("Xóa danh mục thành công.");
        } catch (err) {
            console.error("Error deleting category:", err);
            setTableError("Không thể xóa danh mục. Vui lòng thử lại.");
        } finally {
            closeDeleteDialog();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!formValues.name.trim()) {
            setError("Tên danh mục không được để trống.");
            return;
        }

        setLoading(true);
        try {
            if (isEditing && currentCategoryId) {
                const response = await apiClient.put(
                    `/api/admin/categories/${currentCategoryId}`,
                    {
                        name: formValues.name.trim(),
                        description: formValues.description.trim() || undefined,
                    }
                );

                const updatedCategory = response.data?.data?.category;
                if (updatedCategory) {
                    setCategories((prev) =>
                        prev.map((c) =>
                            (c.id || c._id) === (updatedCategory.id || updatedCategory._id)
                                ? { ...c, ...updatedCategory }
                                : c
                        )
                    );
                } else {
                    fetchCategories();
                }

                setSuccessMessage("Cập nhật danh mục thành công.");
            } else {
                const response = await apiClient.post("/api/admin/categories", {
                    name: formValues.name.trim(),
                    description: formValues.description.trim() || undefined,
                });

                const newCategory = response.data?.data?.category;
                if (newCategory) {
                    setCategories((prev) => [newCategory, ...prev]);
                } else {
                    fetchCategories();
                }

                setSuccessMessage("Thêm danh mục mới thành công.");
            }

            resetForm();
        } catch (err) {
            console.error("Error submitting category form:", err);
            const message =
                err.response?.data?.message ||
                "Đã xảy ra lỗi khi lưu danh mục. Vui lòng thử lại.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSuccessMessage("");
    };

    return (
        <GridContainer>
            {/* Cột Trái - Form */}
            <Box>
                <StyledCard>
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 700, color: '#111827', mb: 3 }}
                        >
                            {isEditing ? "CHỈNH SỬA DANH MỤC" : "THÊM DANH MỤC MỚI"}
                        </Typography>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Tên danh mục"
                                name="name"
                                value={formValues.name}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                                required
                                margin="normal"
                                size="medium"
                            />

                            <TextField
                                label="Mô tả"
                                name="description"
                                value={formValues.description}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                multiline
                                rows={4}
                                size="medium"
                            />

                            <Box sx={{ mt: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={loading}
                                    sx={{
                                        bgcolor: '#c1121f',
                                        borderRadius: 2,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        '&:hover': {
                                            bgcolor: '#991b1b',
                                        },
                                    }}
                                >
                                    {isEditing ? "LƯU THAY ĐỔI" : "THÊM MỚI"}
                                </Button>

                                {isEditing && (
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        fullWidth
                                        size="large"
                                        onClick={resetForm}
                                        disabled={loading}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderColor: '#d1d5db',
                                            color: '#6b7280',
                                            '&:hover': {
                                                borderColor: '#9ca3af',
                                                bgcolor: '#f9fafb',
                                            },
                                        }}
                                    >
                                        HỦY
                                    </Button>
                                )}
                            </Box>
                        </form>
                    </CardContent>
                </StyledCard>
            </Box>

            {/* Cột Phải - Bảng */}
            <Box>
                <StyledCard>
                    <CardContent sx={{ p: 4 }}>
                        <Typography
                            variant="h6"
                            gutterBottom
                            sx={{ fontWeight: 700, color: '#111827', mb: 3 }}
                        >
                            DANH SÁCH DANH MỤC
                        </Typography>

                        {tableError && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {tableError}
                            </Alert>
                        )}

                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{ borderRadius: 2, border: '1px solid #e5e7eb' }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f9fafb' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Tên</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Mô tả</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600, color: '#374151' }}>
                                            Số tài liệu
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600, color: '#374151' }}>
                                            Hành động
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tableLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                                                    <CircularProgress size={24} sx={{ color: '#c1121f' }} />
                                                    <Typography variant="body2" color="textSecondary">
                                                        Đang tải danh sách danh mục...
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                                <Typography variant="body2" color="textSecondary">
                                                    Chưa có danh mục nào.
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category) => {
                                            const id = category.id || category._id;
                                            const documentCount = category.documentCount || 0;
                                            const canDelete = documentCount === 0;

                                            return (
                                                <StyledTableRow key={id}>
                                                    <TableCell sx={{ fontWeight: 500 }}>
                                                        {category.name}
                                                    </TableCell>
                                                    <TableCell sx={{ color: '#6b7280' }}>
                                                        {category.description || "-"}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={documentCount}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: '#dbeafe',
                                                                color: '#1e40af',
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip title="Chỉnh sửa danh mục">
                                                            <IconButton
                                                                color="primary"
                                                                size="small"
                                                                onClick={() => handleEditClick(category)}
                                                                sx={{ mr: 0.5 }}
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={
                                                                canDelete
                                                                    ? "Xóa danh mục"
                                                                    : "Không thể xóa danh mục đang có tài liệu"
                                                            }
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
                                                                    disabled={!canDelete}
                                                                    onClick={() => openDeleteDialog(category)}
                                                                >
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                </StyledTableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </StyledCard>
            </Box>

            {/* Dialog xác nhận xóa */}
            <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Xác nhận xóa danh mục</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Bạn có chắc chắn muốn xóa danh mục "{categoryToDelete?.name}"? Hành
                        động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Hủy</Button>
                    <Button 
                        onClick={handleDeleteConfirmed} 
                        variant="contained"
                        sx={{ 
                            bgcolor: '#dc2626',
                            '&:hover': { bgcolor: '#991b1b' }
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar thông báo */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                {successMessage ? (
                    <Alert
                        onClose={handleSnackbarClose}
                        severity="success"
                        variant="filled"
                    >
                        {successMessage}
                    </Alert>
                ) : null}
            </Snackbar>
        </GridContainer>
    );
};

export default CategoryManagerPage;