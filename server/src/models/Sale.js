const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    sku: { type: String, default: "" },
    barcode: { type: String, default: "" },
    department: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    items: { type: [saleItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0, default: 0 },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "easypaisa", "jazzcash", "raast", "wallet"],
      required: true
    },
    timestamp: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.totalAmount = ret.grandTotal;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Sale", saleSchema);
