const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    items: { type: [mongoose.Schema.Types.Mixed], default: [] },
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    cashier: { type: String, default: "" },
    department: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    status: {
      type: String,
      enum: ["completed", "refunded", "pending"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);
