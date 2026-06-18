const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} = require("../controllers/employeeController");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin", "manager"));
router.get("/", listEmployees);
router.post("/", createEmployee);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
