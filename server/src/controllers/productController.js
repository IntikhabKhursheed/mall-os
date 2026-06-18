const Product = require("../models/Product");
const apiResponse = require("../utils/apiResponse");

const deriveStatus = (stockQuantity, reorderLevel) => {
  if (stockQuantity <= 0) {
    return "out_of_stock";
  }
  if (stockQuantity <= reorderLevel) {
    return "low_stock";
  }
  return "healthy";
};

const buildQuery = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
  const search = (req.query.search || "").trim();
  const department = (req.query.department || "").trim();

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { barcode: { $regex: search, $options: "i" } }
    ];
  }

  if (department) {
    filter.department = department;
  }

  return { page, limit, filter };
};

const listProducts = async (req, res, next) => {
  try {
    const { page, limit, filter } = buildQuery(req);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    return apiResponse(res, 200, true, "Products fetched", {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.status = deriveStatus(Number(payload.stockQuantity || 0), Number(payload.reorderLevel || 0));
    const product = await Product.create(payload);
    return apiResponse(res, 201, true, "Product created", { item: product });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.stockQuantity !== undefined || payload.reorderLevel !== undefined) {
      const stockQuantity = Number(payload.stockQuantity ?? 0);
      const reorderLevel = Number(payload.reorderLevel ?? 0);
      payload.status = deriveStatus(stockQuantity, reorderLevel);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return apiResponse(res, 200, true, "Product updated", { item: product });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return apiResponse(res, 200, true, "Product deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
