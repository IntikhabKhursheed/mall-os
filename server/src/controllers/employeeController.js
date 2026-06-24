const Employee = require("../models/Employee");
const apiResponse = require("../utils/apiResponse");

const toStringValue = (value) => (typeof value === "string" ? value.trim() : "");

const normalizePayload = (body = {}) => ({
  name: toStringValue(body.name ?? body.fullName),
  email: toStringValue(body.email).toLowerCase(),
  phone: toStringValue(body.phone),
  role: toStringValue(body.role),
  department: toStringValue(body.department),
  status: toStringValue(body.status) || "active"
});

const validateEmployee = (payload, { partial = false } = {}) => {
  const errors = {};
  const required = ["name", "email", "phone", "role", "department"];

  required.forEach((field) => {
    if (!partial && !payload[field]) {
      errors[field] = `${field} is required`;
    }
  });

  if (payload.name !== undefined && !payload.name) errors.name = "name is required";
  if (payload.email !== undefined && !payload.email) errors.email = "email is required";
  if (payload.phone !== undefined && !payload.phone) errors.phone = "phone is required";
  if (payload.role !== undefined && !payload.role) errors.role = "role is required";
  if (payload.department !== undefined && !payload.department) errors.department = "department is required";

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = "email must be a valid email address";
  }

  if (payload.status && !["active", "inactive", "on_shift"].includes(payload.status)) {
    errors.status = "status must be active, inactive, or on_shift";
  }

  return errors;
};

const listEmployees = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
    const search = (req.query.search || "").trim();
    const department = (req.query.department || "").trim();
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } }
      ];
    }

    if (department) {
      filter.department = department;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Employee.countDocuments(filter)
    ]);

    return apiResponse(res, 200, true, "Employees fetched", {
      items,
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createEmployee = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const errors = validateEmployee(payload);

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Invalid employee data", errors });
    }

    const employee = await Employee.create(payload);
    return apiResponse(res, 201, true, "Employee created", { item: employee });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "employee";
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        errors: { [field]: `${field} already exists` }
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee data",
        errors: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const errors = validateEmployee(payload, { partial: true });

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Invalid employee data", errors });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    employee.set({
      name: payload.name || employee.name,
      email: payload.email || employee.email,
      phone: payload.phone || employee.phone,
      role: payload.role || employee.role,
      department: payload.department || employee.department,
      status: payload.status || employee.status
    });

    await employee.save();
    return apiResponse(res, 200, true, "Employee updated", { item: employee });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "employee";
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        errors: { [field]: `${field} already exists` }
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee data",
        errors: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return apiResponse(res, 200, true, "Employee deleted", { item: employee });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
