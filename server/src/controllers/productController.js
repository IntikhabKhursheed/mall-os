const Product = require("../models/Product");
const apiResponse = require("../utils/apiResponse");

const deriveStatus = (stock, reorderLevel) => {
  if (stock <= 0) {
    return "out_of_stock";
  }

  if (stock <= reorderLevel) {
    return "low_stock";
  }

  return "healthy";
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return Number.NaN;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const normalizePayload = (body = {}) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  sku: typeof body.sku === "string" ? body.sku.trim() : "",
  barcode: typeof body.barcode === "string" ? body.barcode.trim() : "",
  price: toNumber(body.price ?? body.sellingPrice),
  stock: toNumber(body.stock ?? body.stockQuantity),
  reorderLevel: toNumber(body.reorderLevel),
  department: typeof body.department === "string" ? body.department.trim() : "",
  imageUrl: typeof body.imageUrl === "string" ? body.imageUrl.trim() : typeof body.image === "string" ? body.image.trim() : "",
  status: body.status
});

const validateProduct = (payload, { partial = false } = {}) => {
  const errors = {};
  const required = ["name", "sku", "barcode", "price", "stock", "reorderLevel", "department", "imageUrl"];

  required.forEach((field) => {
    if (!partial && (payload[field] === "" || Number.isNaN(payload[field]) || payload[field] === undefined)) {
      errors[field] = `${field} is required`;
    }
  });

  if (payload.name !== undefined && !payload.name) errors.name = "name is required";
  if (payload.sku !== undefined && !payload.sku) errors.sku = "sku is required";
  if (payload.barcode !== undefined && !payload.barcode) errors.barcode = "barcode is required";
  if (payload.department !== undefined && !payload.department) errors.department = "department is required";
  if (payload.imageUrl !== undefined && !payload.imageUrl) errors.imageUrl = "imageUrl is required";

  if (payload.price !== undefined && (!Number.isFinite(payload.price) || payload.price < 0)) {
    errors.price = "price must be a valid non-negative number";
  }
  if (payload.stock !== undefined && (!Number.isFinite(payload.stock) || payload.stock < 0)) {
    errors.stock = "stock must be a valid non-negative number";
  }
  if (payload.reorderLevel !== undefined && (!Number.isFinite(payload.reorderLevel) || payload.reorderLevel < 0)) {
    errors.reorderLevel = "reorderLevel must be a valid non-negative number";
  }

  if (payload.sku && payload.sku.length < 2) {
    errors.sku = "sku must be at least 2 characters";
  }

  return errors;
};

const listProducts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const search = (req.query.search || "").trim();
    const department = (req.query.department || "").trim();
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { barcode: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } }
      ];
    }

    if (department) {
      filter.department = department;
    }

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
      totalPages: Math.max(1, Math.ceil(total / limit))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const errors = validateProduct(payload);

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Invalid product data", errors });
    }

    const product = await Product.create({
      ...payload,
      status: deriveStatus(payload.stock, payload.reorderLevel)
    });

    return apiResponse(res, 201, true, "Product created", { item: product });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "product";
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        errors: { [field]: `${field} already exists` }
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const errors = validateProduct(payload, { partial: true });

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Invalid product data", errors });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const next = {
      name: payload.name || product.name,
      sku: payload.sku || product.sku,
      barcode: payload.barcode || product.barcode,
      price: Number.isFinite(payload.price) ? payload.price : product.price,
      stock: Number.isFinite(payload.stock) ? payload.stock : product.stock,
      reorderLevel: Number.isFinite(payload.reorderLevel) ? payload.reorderLevel : product.reorderLevel,
      department: payload.department || product.department,
      imageUrl: payload.imageUrl || product.imageUrl
    };

    product.set(next);
    product.status = deriveStatus(product.stock, product.reorderLevel);
    await product.save();

    return apiResponse(res, 200, true, "Product updated", { item: product });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "product";
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        errors: { [field]: `${field} already exists` }
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product data",
        errors: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return apiResponse(res, 200, true, "Product deleted", { item: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deriveStatus
};
