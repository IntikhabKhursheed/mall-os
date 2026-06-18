const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require("../controllers/departmentController");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin", "manager"));
router.get("/", listDepartments);
router.post("/", createDepartment);
router.put("/:id", updateDepartment);
router.delete("/:id", deleteDepartment);

module.exports = router;
