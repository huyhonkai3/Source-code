import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
    Box,
    LinearProgress,
    IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import apiClient from "../../api/axiosConfig";

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    maxWidth: 896, // max-w-4xl
    margin: '0 auto',
}));

const DropzoneBox = styled(Box)(({ theme, isDragActive }) => ({
    border: '2px dashed #d1d5db',
    borderRadius: 8,
    padding: theme.spacing(6),
    textAlign: 'center',
    backgroundColor: isDragActive ? '#fef2f2' : '#f9fafb',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
        backgroundColor: '#fef2f2',
        borderColor: '#c1121f',
    },
}));

const FileInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginTop: theme.spacing(2),
}));

const DocumentUploadPage = () => {
    const [categories, setCategories] = useState([]);
    const [formValues, setFormValues] = useState({
        title: "",
        description: "",
        category: "",
        author: "",
        publishYear: "",
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragActive, setIsDragActive] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Fetch categories khi component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await apiClient.get("/api/categories");
            const data = response.data?.data;
            setCategories(data?.categories || []);
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateFile = (file) => {
        // Kiểm tra type
        if (file.type !== "application/pdf") {
            setError("Chỉ chấp nhận file PDF");
            return false;
        }

        // Kiểm tra size (50MB = 50 * 1024 * 1024 bytes)
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("Kích thước file không được vượt quá 50MB");
            return false;
        }

        return true;
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            setError("");
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            setError("");
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        // Validation
        if (!selectedFile) {
            setError("Vui lòng chọn file PDF để tải lên");
            return;
        }

        if (!formValues.title.trim()) {
            setError("Tiêu đề tài liệu là bắt buộc");
            return;
        }

        if (!formValues.category) {
            setError("Vui lòng chọn danh mục");
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            // Tạo FormData
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("title", formValues.title.trim());
            formData.append("description", formValues.description.trim());
            formData.append("category", formValues.category);
            
            if (formValues.author.trim()) {
                formData.append("author", formValues.author.trim());
            }
            
            if (formValues.publishYear) {
                formData.append("publishYear", formValues.publishYear);
            }

            // Upload với progress tracking
            const response = await apiClient.post("/api/documents/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(percentCompleted);
                },
            });

            setSuccessMessage(
                "Tải lên thành công! Tài liệu của bạn đang chờ kiểm duyệt."
            );

            // Reset form
            setFormValues({
                title: "",
                description: "",
                category: "",
                author: "",
                publishYear: "",
            });
            setSelectedFile(null);
            setUploadProgress(0);
        } catch (err) {
            console.error("Error uploading document:", err);
            const message =
                err.response?.data?.message ||
                "Đã xảy ra lỗi khi tải lên tài liệu. Vui lòng thử lại.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleSnackbarClose = () => {
        setSuccessMessage("");
    };

    const isFormValid = selectedFile && formValues.title.trim() && formValues.category;

    return (
        <StyledCard>
            <CardContent sx={{ p: 4 }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{ fontWeight: 700, color: '#111827', mb: 3 }}
                >
                    TẢI LÊN TÀI LIỆU MỚI
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {/* File Upload Dropzone */}
                    <Box sx={{ mb: 3 }}>
                        <input
                            type="file"
                            id="file-input"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        
                        {!selectedFile ? (
                            <DropzoneBox
                                isDragActive={isDragActive}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-input').click()}
                            >
                                <CloudUploadIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                                <Typography variant="body1" sx={{ color: '#6b7280', mb: 1 }}>
                                    Kéo thả file PDF vào đây
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 2 }}>
                                    hoặc
                                </Typography>
                                <Button
                                    variant="outlined"
                                    component="span"
                                    sx={{ 
                                        textTransform: 'none',
                                        borderColor: '#d1d5db',
                                        color: '#6b7280',
                                    }}
                                >
                                    Chọn file
                                </Button>
                                <Typography variant="caption" sx={{ display: 'block', color: '#9ca3af', mt: 2 }}>
                                    Chỉ chấp nhận file PDF, tối đa 50MB
                                </Typography>
                            </DropzoneBox>
                        ) : (
                            <FileInfo>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <InsertDriveFileIcon sx={{ color: '#c1121f', fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {selectedFile.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                            {formatFileSize(selectedFile.size)}
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton 
                                    size="small" 
                                    onClick={handleRemoveFile}
                                    disabled={loading}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </FileInfo>
                        )}
                    </Box>

                    {/* Upload Progress */}
                    {loading && uploadProgress > 0 && (
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    Đang tải lên...
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    {uploadProgress}%
                                </Typography>
                            </Box>
                            <LinearProgress 
                                variant="determinate" 
                                value={uploadProgress}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    '& .MuiLinearProgress-bar': {
                                        bgcolor: '#c1121f',
                                    },
                                }}
                            />
                        </Box>
                    )}

                    {/* Title */}
                    <TextField
                        label="Tiêu đề tài liệu"
                        name="title"
                        value={formValues.title}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        required
                        margin="normal"
                        disabled={loading}
                        helperText="Tiêu đề ngắn gọn, mô tả chính xác nội dung tài liệu"
                    />

                    {/* Description */}
                    <TextField
                        label="Mô tả"
                        name="description"
                        value={formValues.description}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={5}
                        disabled={loading}
                        helperText="Mô tả chi tiết về nội dung, mục đích sử dụng của tài liệu"
                    />

                    {/* Category */}
                    <FormControl fullWidth margin="normal" required disabled={loading || categoriesLoading}>
                        <InputLabel id="category-label">Danh mục</InputLabel>
                        <Select
                            labelId="category-label"
                            label="Danh mục"
                            name="category"
                            value={formValues.category}
                            onChange={handleChange}
                        >
                            {categoriesLoading ? (
                                <MenuItem value="" disabled>Đang tải danh mục...</MenuItem>
                            ) : categories.length === 0 ? (
                                <MenuItem value="" disabled>Chưa có danh mục</MenuItem>
                            ) : (
                                categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    {/* Author */}
                    <TextField
                        label="Tên tác giả (nếu có)"
                        name="author"
                        value={formValues.author}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        disabled={loading}
                        helperText="Tên tác giả hoặc tổ chức xuất bản"
                    />

                    {/* Publish Year */}
                    <TextField
                        label="Năm xuất bản (nếu có)"
                        name="publishYear"
                        type="number"
                        value={formValues.publishYear}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        disabled={loading}
                        inputProps={{ 
                            min: 1900, 
                            max: new Date().getFullYear(),
                            step: 1 
                        }}
                        helperText={`Năm xuất bản (1900 - ${new Date().getFullYear()})`}
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={!isFormValid || loading}
                        sx={{
                            mt: 4,
                            bgcolor: '#c1121f',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            py: 1.5,
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                            '&:hover': {
                                bgcolor: '#991b1b',
                            },
                            '&:disabled': {
                                bgcolor: '#d1d5db',
                                color: '#9ca3af',
                            },
                        }}
                    >
                        {loading ? "ĐANG TẢI LÊN..." : "TẢI LÊN VÀ CHỜ DUYỆT"}
                    </Button>
                </form>
            </CardContent>

            {/* Success Snackbar */}
            <Snackbar
                open={!!successMessage}
                autoHideDuration={5000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                {successMessage ? (
                    <Alert
                        onClose={handleSnackbarClose}
                        severity="success"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {successMessage}
                    </Alert>
                ) : null}
            </Snackbar>
        </StyledCard>
    );
};

export default DocumentUploadPage;