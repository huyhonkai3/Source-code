const Category = require("../models/category.model");

/**
 * API 2.1: Tạo danh mục mới (F10)
 * POST /api/admin/categories
 * Access: Admin
 */
const createCategory = async (req, res) => {
try {
    const { name, description, parentId } = req.body;

    // Validation: Kiểm tra name bắt buộc
    if (!name || !name.trim()) {
    return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors: [
        {
            field: "name",
            message: "Tên danh mục là bắt buộc",
        },
        ],
    });
    }

    // Kiểm tra tên danh mục đã tồn tại chưa
    const existingCategory = await Category.findOne({
    name: name.trim(),
    });

    if (existingCategory) {
    return res.status(409).json({
        status: "error",
        code: 409,
        message: "Tên danh mục đã tồn tại",
        errors: [
        {
            field: "name",
            message: "Tên danh mục này đã được sử dụng",
        },
        ],
    });
    }

    // Nếu có parentId, kiểm tra danh mục cha có tồn tại không
    if (parentId) {
    const parentCategory = await Category.findById(parentId);
    if (!parentCategory) {
        return res.status(404).json({
        status: "error",
        code: 404,
        message: "Danh mục cha không tồn tại",
        });
    }
    }

    // Tạo danh mục mới
    // Slug sẽ được tự động tạo bởi pre-save hook
    const newCategory = new Category({
    name: name.trim(),
    description: description ? description.trim() : "",
    parentId: parentId || null,
    });

    await newCategory.save();

    // Trả về response thành công
    return res.status(201).json({
    status: "success",
    code: 201,
    message: "Tạo danh mục thành công",
    data: {
        category: {
        id: newCategory._id,
        name: newCategory.name,
        description: newCategory.description,
        slug: newCategory.slug,
        parentId: newCategory.parentId,
        documentCount: newCategory.documentCount,
        createdAt: newCategory.createdAt,
        },
    },
    });
} catch (error) {
    console.error("Create category error:", error);

    // Xử lý lỗi validation của Mongoose
    if (error.name === "ValidationError") {
    const errors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
    }));

    return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors,
    });
    }

    return res.status(500).json({
    status: "error",
    code: 500,
    message: "Lỗi server khi tạo danh mục",
    });
}
};

/**
 * API 2.2: Cập nhật danh mục (F10)
 * PUT /api/admin/categories/:id
 * Access: Admin
 */
const updateCategory = async (req, res) => {
try {
    const { id } = req.params;
    const { name, description, parentId } = req.body;

    // Tìm danh mục cần cập nhật
    const category = await Category.findById(id);

    if (!category) {
    return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy danh mục",
    });
    }

    // Nếu cập nhật name, kiểm tra trùng lặp (trừ chính nó)
    if (name && name.trim() !== category.name) {
    const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: id }, // Loại trừ chính nó
    });

    if (existingCategory) {
        return res.status(409).json({
        status: "error",
        code: 409,
        message: "Tên danh mục đã tồn tại",
        errors: [
            {
            field: "name",
            message: "Tên danh mục này đã được sử dụng",
            },
        ],
        });
    }

    // Cập nhật name và slug sẽ được tự động tạo lại bởi pre-save hook
    category.name = name.trim();
    }

    // Cập nhật description
    if (description !== undefined) {
    category.description = description.trim();
    }

    // Cập nhật parentId
    if (parentId !== undefined) {
    // Nếu parentId null, đặt thành null
    if (!parentId) {
        category.parentId = null;
    } else {
        // Kiểm tra danh mục cha có tồn tại không
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
        return res.status(404).json({
            status: "error",
            code: 404,
            message: "Danh mục cha không tồn tại",
        });
        }

        // Không cho phép đặt chính nó làm danh mục cha
        if (parentId === id) {
        return res.status(400).json({
            status: "error",
            code: 400,
            message: "Không thể đặt chính danh mục này làm danh mục cha",
        });
        }

        category.parentId = parentId;
    }
    }

    await category.save();

    // Trả về response thành công
    return res.status(200).json({
    status: "success",
    code: 200,
    message: "Cập nhật danh mục thành công",
    data: {
        category: {
        id: category._id,
        name: category.name,
        description: category.description,
        slug: category.slug,
        parentId: category.parentId,
        documentCount: category.documentCount,
        updatedAt: category.updatedAt,
        },
    },
    });
} catch (error) {
    console.error("Update category error:", error);

    // Xử lý lỗi validation của Mongoose
    if (error.name === "ValidationError") {
    const errors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
    }));

    return res.status(400).json({
        status: "error",
        code: 400,
        message: "Dữ liệu không hợp lệ",
        errors,
    });
    }

    return res.status(500).json({
    status: "error",
    code: 500,
    message: "Lỗi server khi cập nhật danh mục",
    });
}
};

/**
 * API 2.3: Xóa danh mục (F10)
 * DELETE /api/admin/categories/:id
 * Access: Admin
 * Không cho phép xóa danh mục đang chứa tài liệu (documentCount > 0)
 */
const deleteCategory = async (req, res) => {
try {
    const { id } = req.params;

    // Tìm danh mục cần xóa
    const category = await Category.findById(id);

    if (!category) {
    return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy danh mục",
    });
    }

    // QUAN TRỌNG: Kiểm tra documentCount
    if (category.documentCount > 0) {
    return res.status(400).json({
        status: "error",
        code: 400,
        message: "Không thể xóa danh mục đang chứa tài liệu",
    });
    }

    // Xóa danh mục
    await Category.findByIdAndDelete(id);

    // Trả về response thành công
    return res.status(200).json({
    status: "success",
    code: 200,
    message: "Xóa danh mục thành công",
    });
} catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
    status: "error",
    code: 500,
    message: "Lỗi server khi xóa danh mục",
    });
}
};

/**
 * API 2.4: Lấy danh sách tất cả danh mục (F10)
 * GET /api/categories
 * Access: Public
 */
const getAllCategories = async (req, res) => {
try {
    // Tìm tất cả danh mục
    const categories = await Category.find()
    .sort({ name: 1 }) // Sắp xếp theo tên A-Z
    .select(
        "_id name description slug parentId documentCount createdAt updatedAt"
    );

    // Trả về response thành công
    return res.status(200).json({
    status: "success",
    code: 200,
    message: "Lấy danh sách danh mục thành công",
    data: {
        categories: categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        description: cat.description,
        slug: cat.slug,
        parentId: cat.parentId,
        documentCount: cat.documentCount,
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
        })),
        total: categories.length,
    },
    });
} catch (error) {
    console.error("Get all categories error:", error);

    return res.status(500).json({
    status: "error",
    code: 500,
    message: "Lỗi server khi lấy danh sách danh mục",
    });
}
};

module.exports = {
createCategory,
updateCategory,
deleteCategory,
getAllCategories,
};
