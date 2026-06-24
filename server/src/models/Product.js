const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, unique: true },
    barcode: { type: String, required: true, trim: true, unique: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reorderLevel: { type: Number, required: true, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["healthy", "low_stock", "out_of_stock"],
      default: "healthy"
    },
    department: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true, default: "" }
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.sellingPrice = ret.price;
        ret.stockQuantity = ret.stock;
        ret.image = ret.imageUrl;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Product", productSchema);
