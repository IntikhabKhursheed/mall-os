const mongoose = require("mongoose");
const Sale = require("../models/Sale");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const { deriveStatus } = require("./productController");

const normalizeItems = (items = []) =>
  items
    .map((item) => ({
      productId: item.productId || item._id,
      quantity: Number(item.quantity || 0)
    }))
    .filter((item) => item.productId);

const validateSalePayload = (body = {}) => {
  const errors = {};

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.items = "At least one item is required";
  }

  const allowedPaymentMethods = ["cash", "card", "easypaisa", "jazzcash", "raast", "wallet"];
  const paymentMethod = body.paymentMethod ? String(body.paymentMethod).toLowerCase() : "";

  if (!allowedPaymentMethods.includes(paymentMethod)) {
    errors.paymentMethod = "paymentMethod must be cash, card, Easypaisa/JazzCash, Raast, or wallet";
  }

  return errors;
};

const createSale = async (req, res) => {
  const payload = {
    items: normalizeItems(req.body.items),
    discount: Number(req.body.discount || 0),
    tax: Number(req.body.tax || 0),
    paymentMethod: req.body.paymentMethod ? String(req.body.paymentMethod).toLowerCase() : "cash",
    timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date()
  };

  const errors = validateSalePayload(req.body);
  if (Object.keys(errors).length) {
    return res.status(400).json({ success: false, message: "Invalid sale data", errors });
  }

  if (!Number.isFinite(payload.discount) || payload.discount < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid sale data",
      errors: { discount: "discount must be a valid non-negative number" }
    });
  }

  if (!Number.isFinite(payload.tax) || payload.tax < 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid sale data",
      errors: { tax: "tax must be a valid non-negative number" }
    });
  }

  if (payload.items.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
    return res.status(400).json({
      success: false,
      message: "Invalid sale data",
      errors: { items: "Each item quantity must be a positive number" }
    });
  }

  const session = await mongoose.startSession();
  const updatedProducts = [];
  const notifications = [];

  try {
    let saleDoc = null;

    await session.withTransaction(async () => {
      const aggregatedItems = new Map();
      for (const item of payload.items) {
        const key = String(item.productId);
        aggregatedItems.set(key, (aggregatedItems.get(key) || 0) + item.quantity);
      }

      const saleItems = [];
      let subtotal = 0;

      for (const [productId, quantity] of aggregatedItems.entries()) {
        const product = await Product.findById(productId).session(session);
        if (!product) {
          throw Object.assign(new Error("Product not found"), { statusCode: 404, field: "productId" });
        }

        if (quantity > product.stock) {
          throw Object.assign(new Error(`Not enough stock for ${product.name}`), {
            statusCode: 400,
            field: "quantity",
            productId
          });
        }

        const previousStatus = product.status;
        const nextStock = product.stock - quantity;
        const nextStatus = deriveStatus(nextStock, product.reorderLevel);
        const lineTotal = product.price * quantity;

        product.stock = nextStock;
        product.status = nextStatus;
        await product.save({ session });

        updatedProducts.push(product);
        saleItems.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          department: product.department,
          quantity,
          unitPrice: product.price,
          lineTotal
        });
        subtotal += lineTotal;

        if (previousStatus !== nextStatus && (nextStatus === "low_stock" || nextStatus === "out_of_stock")) {
          const notification = await Notification.create(
            [
              {
                title: nextStatus === "out_of_stock" ? "Inventory out of stock" : "Inventory low stock",
                description: `${product.name} is now ${nextStatus.replace("_", " ")}.`,
                type: nextStatus === "out_of_stock" ? "danger" : "warning",
                source: "pos",
                productId: product._id
              }
            ],
            { session }
          );
          notifications.push(notification[0]);
        }
      }

      const discount = Math.min(payload.discount, subtotal);
      const tax = payload.tax;
      const grandTotal = Math.max(0, subtotal - discount + tax);

      saleDoc = await Sale.create(
        [
          {
            items: saleItems,
            subtotal,
            discount,
            tax,
            grandTotal,
            paymentMethod: payload.paymentMethod,
            timestamp: payload.timestamp
          }
        ],
        { session }
      );
      saleDoc = saleDoc[0];
    });

    return res.status(201).json({
      success: true,
      message: "Sale completed",
      data: {
        saleId: saleDoc._id,
        updatedProducts,
        notifications
      }
    });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message });
    }

    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errors: error.field ? { [error.field]: error.message } : undefined
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

module.exports = {
  createSale,
  validateSalePayload
};
