// Trang Chủ & Tìm kiếm (F11 / Public)
// API: 2.7 (GET /api/documents)
// API: 2.4 (GET /api/categories)

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Pagination,
    Grid,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";

const HomePage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // ======================== STATE MANAGEMENT ========================
    const [documents, setDocuments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter & Sort state
    const [filters, setFilters] = useState({
        q: searchParams.get("q") || "",
        category: searchParams.get("category") || "",
        year: searchParams.get("year") || "",
        sort: searchParams.get("sort") || "createdAt:desc",
    });

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: parseInt(searchParams.get("page")) || 1,
        totalPages: 1,
        totalDocuments: 0,
        limit: 12,
    });

    // ======================== API CALLS ========================
    const fetchCategories = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:5000/api/categories`
            );

            if (response.data.status === "success") {
                setCategories(response.data.data.categories);
            }
        } catch (err) {
            console.error("Fetch categories error:", err);
            console.error("API URL:", "http://localhost:5000");
        }
    }, []);

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: pagination.currentPage,
                limit: pagination.limit,
            };

            if (filters.q) params.q = filters.q;
            if (filters.category) params.category = filters.category;
            if (filters.year) params.year = filters.year;
            if (filters.sort) params.sort = filters.sort;

            const apiUrl = 'http://localhost:5000';
            console.log('Fetching documents from:', apiUrl);
            
            const response = await axios.get(
                `${apiUrl}/api/documents`,
                { params }
            );

            if (response.data.status === "success") {
                setDocuments(response.data.data.documents);
                setPagination(prev => ({
                    ...prev,
                    ...response.data.data.pagination,
                }));
            }
        } catch (err) {
            console.error("Fetch documents error:", err);
            console.error("Error details:", {
                message: err.message,
                response: err.response?.data,
                apiUrl: 'http://localhost:5000'
            });
            
            let errorMessage = "Lỗi khi tải danh sách tài liệu";
            
            if (err.code === 'ERR_NETWORK') {
                errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.";
            } else if (err.response) {
                errorMessage = err.response.data?.message || errorMessage;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [pagination.currentPage, pagination.limit, filters]);

    // ======================== EFFECTS ========================
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    useEffect(() => {
        // Sync filters với URL query params
        const q = searchParams.get("q");
        if (q && q !== filters.q) {
            setFilters(prev => ({ ...prev, q }));
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }
    }, [searchParams, filters.q]);

    // ======================== EVENT HANDLERS ========================
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const handlePageChange = (event, newPage) => {
        setPagination(prev => ({ ...prev, currentPage: newPage }));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDocumentClick = (docId) => {
        navigate(`/documents/${docId}`);
    };

    // ======================== RENDER ========================
    return (
        <Box className="p-8 bg-gray-100 min-h-screen">
            {/* Error Alert */}
            {error && (
                <Alert severity="error" onClose={() => setError(null)} className="mb-4">
                    {error}
                </Alert>
            )}

            <Grid container spacing={6}>
                {/* ====================== SIDEBAR - BỘ LỌC ====================== */}
                <Grid item xs={12} lg={3}>
                    <Card className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                        <Typography
                            variant="h6"
                            className="font-bold text-gray-900 mb-4"
                            gutterBottom
                        >
                            Bộ lọc
                        </Typography>

                        {/* Filter: Danh mục */}
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel>Danh mục</InputLabel>
                            <Select
                                value={filters.category}
                                onChange={(e) =>
                                    handleFilterChange("category", e.target.value)
                                }
                                label="Danh mục"
                            >
                                <MenuItem value="">
                                    <em>Tất cả danh mục</em>
                                </MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name} ({cat.documentCount})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Filter: Sắp xếp */}
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel>Sắp xếp</InputLabel>
                            <Select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange("sort", e.target.value)}
                                label="Sắp xếp"
                            >
                                <MenuItem value="createdAt:desc">Mới nhất</MenuItem>
                                <MenuItem value="views:desc">Xem nhiều nhất</MenuItem>
                                <MenuItem value="downloads:desc">
                                    Tải nhiều nhất
                                </MenuItem>
                                <MenuItem value="title:asc">Tên A-Z</MenuItem>
                                <MenuItem value="title:desc">Tên Z-A</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Filter: Năm xuất bản */}
                        <TextField
                            label="Năm xuất bản"
                            type="number"
                            fullWidth
                            margin="normal"
                            variant="outlined"
                            value={filters.year}
                            onChange={(e) => handleFilterChange("year", e.target.value)}
                            inputProps={{
                                min: 1900,
                                max: new Date().getFullYear(),
                            }}
                        />
                    </Card>
                </Grid>

                {/* ====================== CONTENT - KẾT QUẢ ====================== */}
                <Grid item xs={12} lg={9}>
                    {/* Result Count */}
                    <Box className="mb-6">
                        <Typography variant="h6" className="font-semibold text-gray-900">
                            {loading
                                ? "Đang tải..."
                                : `Hiển thị ${pagination.totalDocuments} kết quả`}
                        </Typography>
                        {filters.q && (
                            <Typography variant="body2" className="text-gray-600">
                                Tìm kiếm cho: <strong>"{filters.q}"</strong>
                            </Typography>
                        )}
                    </Box>

                    {/* Loading State */}
                    {loading && (
                        <Box className="flex justify-center items-center py-12">
                            <CircularProgress color="error" />
                        </Box>
                    )}

                    {/* Document Grid */}
                    {!loading && (
                        <>
                            {documents.length === 0 ? (
                                <Card className="bg-white rounded-xl shadow-lg p-12 text-center">
                                    <Typography
                                        variant="h6"
                                        className="text-gray-500 mb-2"
                                    >
                                        Không tìm thấy tài liệu nào
                                    </Typography>
                                    <Typography variant="body2" className="text-gray-400">
                                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                                    </Typography>
                                </Card>
                            ) : (
                                <Grid container spacing={3}>
                                    {documents.map((doc) => (
                                        <Grid item xs={12} sm={6} md={4} key={doc.id}>
                                            <Card
                                                className="rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full flex flex-col"
                                                onClick={() => handleDocumentClick(doc.id)}
                                            >
                                                {/* Cover Image */}
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={
                                                        doc.coverImage ||
                                                        "https://via.placeholder.com/400x200?text=No+Cover"
                                                    }
                                                    alt={doc.title}
                                                    sx={{ height: 200, objectFit: "cover" }}
                                                />

                                                {/* Content */}
                                                <CardContent className="flex-1">
                                                    <Typography
                                                        variant="h6"
                                                        className="font-bold text-gray-900 mb-2 line-clamp-2"
                                                        title={doc.title}
                                                    >
                                                        {doc.title}
                                                    </Typography>

                                                    {doc.author && (
                                                        <Typography
                                                            variant="body2"
                                                            className="text-gray-600 mb-2"
                                                        >
                                                            Tác giả: {doc.author}
                                                        </Typography>
                                                    )}

                                                    {doc.category && (
                                                        <Chip
                                                            label={doc.category.name}
                                                            size="small"
                                                            className="bg-red-50 text-red-700 mb-2"
                                                        />
                                                    )}

                                                    {doc.description && (
                                                        <Typography
                                                            variant="body2"
                                                            className="text-gray-500 mt-2 line-clamp-3"
                                                        >
                                                            {doc.description}
                                                        </Typography>
                                                    )}
                                                </CardContent>

                                                {/* Actions - Stats */}
                                                <CardActions className="px-4 pb-4 pt-0">
                                                    <Box className="flex items-center gap-4 text-gray-600">
                                                        <Box className="flex items-center gap-1">
                                                            <VisibilityIcon
                                                                fontSize="small"
                                                                className="text-gray-500"
                                                            />
                                                            <Typography variant="caption">
                                                                {doc.views || 0}
                                                            </Typography>
                                                        </Box>
                                                        <Box className="flex items-center gap-1">
                                                            <DownloadIcon
                                                                fontSize="small"
                                                                className="text-gray-500"
                                                            />
                                                            <Typography variant="caption">
                                                                {doc.downloads || 0}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <Box className="flex justify-center mt-8">
                                    <Pagination
                                        count={pagination.totalPages}
                                        page={pagination.currentPage}
                                        onChange={handlePageChange}
                                        color="primary"
                                        size="large"
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default HomePage;