const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["info", "success", "warning", "danger"],
      default: "info"
    },
    source: { type: String, default: "system" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null }
  },
  {
    timestamps: { createdAt: true, updatedAt: true }
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
