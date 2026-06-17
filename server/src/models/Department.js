const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    manager: { type: String, default: "" },
    status: { type: String, default: "active" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
