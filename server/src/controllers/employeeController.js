const Employee = require("../models/Employee");
const apiResponse = require("../utils/apiResponse");

const buildQuery = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.max(parseInt(req.query.limit || "10", 10), 1);
  const search = (req.query.search || "").trim();
  const department = (req.query.department || "").trim();

  const filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (department) {
    filter.department = department;
  }

  return { page, limit, filter };
};

const listEmployees = async (req, res, next) => {
  try {
    const { page, limit, filter } = buildQuery(req);
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
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);
    return apiResponse(res, 201, true, "Employee created", { item: employee });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return apiResponse(res, 200, true, "Employee updated", { item: employee });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    return apiResponse(res, 200, true, "Employee deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
};
