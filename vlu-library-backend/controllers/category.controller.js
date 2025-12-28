const Category = require("../models/category.model");
const Document = require("../models/document.model");

/**
 * API 2.1: Tạo danh mục mới (F10)
 * POST /api/admin/categories
 * Access: Admin
 */
const createCategory = async (req, res) => {
  try {
    const { name, description, parentId } = req.body;

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

    const newCategory = new Category({
      name: name.trim(),
      description: description ? description.trim() : "",
      parentId: parentId || null,
    });

    await newCategory.save();

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

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy danh mục",
      });
    }

    if (name && name.trim() !== category.name) {
      const existingCategory = await Category.findOne({
        name: name.trim(),
        _id: { $ne: id },
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

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (parentId !== undefined) {
      if (!parentId) {
        category.parentId = null;
      } else {
        const parentCategory = await Category.findById(parentId);
        if (!parentCategory) {
          return res.status(404).json({
            status: "error",
            code: 404,
            message: "Danh mục cha không tồn tại",
          });
        }

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
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "Không tìm thấy danh mục",
      });
    }

    if (category.documentCount > 0) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Không thể xóa danh mục đang chứa tài liệu",
      });
    }

    await Category.findByIdAndDelete(id);

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
 * API 2.4: Lấy danh sách tất cả danh mục
 * GET /api/categories (Public - đếm approved only)
 * GET /api/admin/categories (Admin - đếm tất cả status)
 *
 * Logic phân biệt tự động dựa trên route:
 * - Public route (/api/categories): documentCount = số tài liệu APPROVED
 * - Admin route (/api/admin/categories): documentCount = TỔNG tất cả (như cũ)
 *
 * Điều này đảm bảo:
 * - User/Author/Guest thấy đúng số tài liệu họ có thể xem
 * - Admin thấy tổng số để quản lý
 *
 * KHÔNG CẦN thay đổi frontend hay thêm route mới!
 */
const getAllCategories = async (req, res) => {
  try {
    // Kiểm tra route để xác định mode đếm
    const isAdminRoute = req.originalUrl.startsWith("/api/admin");

    // Lấy tất cả danh mục
    const categories = await Category.find()
      .sort({ name: 1 })
      .select(
        "_id name description slug parentId documentCount createdAt updatedAt",
      )
      .lean();

    let result;

    if (isAdminRoute) {
      // ADMIN: Trả về documentCount gốc (tổng tất cả status)
      // Đây là giá trị được lưu trong Category model
      result = categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        description: cat.description,
        slug: cat.slug,
        parentId: cat.parentId,
        documentCount: cat.documentCount, // Tổng tất cả
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      }));
    } else {
      // PUBLIC: Đếm lại số tài liệu APPROVED cho mỗi category
      const approvedCounts = await Document.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ]);

      // Tạo map để lookup nhanh: { categoryId: approvedCount }
      const countMap = new Map();
      approvedCounts.forEach((item) => {
        countMap.set(item._id.toString(), item.count);
      });

      // Gán documentCount = số approved
      result = categories.map((cat) => ({
        id: cat._id,
        name: cat.name,
        description: cat.description,
        slug: cat.slug,
        parentId: cat.parentId,
        documentCount: countMap.get(cat._id.toString()) || 0, // Chỉ approved
        createdAt: cat.createdAt,
        updatedAt: cat.updatedAt,
      }));
    }

    return res.status(200).json({
      status: "success",
      code: 200,
      message: "Lấy danh sách danh mục thành công",
      data: {
        categories: result,
        total: result.length,
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
