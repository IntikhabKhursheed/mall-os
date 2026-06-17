const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, required: true, unique: true },
    sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sale" },
    cashier: { type: String, default: "" },
    department: { type: String, default: "" },
    itemsCount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: "" },
    status: { type: String, default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
