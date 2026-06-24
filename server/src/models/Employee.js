const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["active", "inactive", "on_shift"],
      default: "active"
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        ret.fullName = ret.name;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
