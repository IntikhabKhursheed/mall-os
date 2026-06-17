const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: "" },
    barcode: { type: String, default: "" },
    category: { type: String, default: "" },
    department: { type: String, default: "" },
    sellingPrice: { type: Number, default: 0 },
    costPrice: { type: Number, default: 0 },
    stockQuantity: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["healthy", "low_stock", "out_of_stock"],
      default: "healthy"
    },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
