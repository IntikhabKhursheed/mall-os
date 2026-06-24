const Department = require("../models/Department");
const apiResponse = require("../utils/apiResponse");

const normalizePayload = (body = {}) => ({
  name: typeof body.name === "string" ? body.name.trim() : "",
  managerId: typeof body.managerId === "string" ? body.managerId.trim() : typeof body.manager === "string" ? body.manager.trim() : "",
  status: typeof body.status === "string" ? body.status.trim() : "active"
});

const validateDepartment = (payload, { partial = false } = {}) => {
  const errors = {};

  if (!partial && !payload.name) errors.name = "name is required";
  if (!partial && !payload.managerId) errors.managerId = "managerId is required";

  if (payload.name !== undefined && !payload.name) errors.name = "name is required";
  if (payload.managerId !== undefined && !payload.managerId) errors.managerId = "managerId is required";

  if (payload.status && !["active", "inactive"].includes(payload.status)) {
    errors.status = "status must be active or inactive";
  }

  return errors;
};

const listDepartments = async (req, res) => {
  try {
    const items = await Department.find().sort({ createdAt: -1 });
    return apiResponse(res, 200, true, "Departments fetched", { items });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const createDepartment = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const errors = validateDepartment(payload);

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Invalid department data", errors });
    }

    const department = await Department.create(payload);
    return apiResponse(res, 201, true, "Department created", { item: department });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department name already exists",
        errors: { name: "Department name already exists" }
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid department data",
        errors: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    const errors = validateDepartment(payload, { partial: true });

    if (Object.keys(errors).length) {
      return res.status(400).json({ success: false, message: "Invalid department data", errors });
    }

    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    department.set({
      name: payload.name || department.name,
      managerId: payload.managerId || department.managerId,
      status: payload.status || department.status
    });

    await department.save();
    return apiResponse(res, 200, true, "Department updated", { item: department });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Department name already exists",
        errors: { name: "Department name already exists" }
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid department data",
        errors: Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]))
      });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return apiResponse(res, 200, true, "Department deleted", { item: department });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
