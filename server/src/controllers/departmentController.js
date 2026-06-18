const Department = require("../models/Department");
const apiResponse = require("../utils/apiResponse");

const listDepartments = async (req, res, next) => {
  try {
    const items = await Department.find().sort({ createdAt: -1 });
    return apiResponse(res, 200, true, "Departments fetched", { items });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    return apiResponse(res, 201, true, "Department created", { item: department });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return apiResponse(res, 200, true, "Department updated", { item: department });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    return apiResponse(res, 200, true, "Department deleted");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
