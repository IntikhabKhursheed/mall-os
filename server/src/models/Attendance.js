const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    clockIn: { type: Date, default: null },
    clockOut: { type: Date, default: null },
    date: { type: Date, default: Date.now },
    status: { type: String, default: "present" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
