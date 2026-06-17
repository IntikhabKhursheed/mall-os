const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "" },
    role: { type: String, default: "" },
    department: { type: String, default: "" },
    status: { type: String, default: "active" },
    clockInTime: { type: Date, default: null },
    lastActive: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
