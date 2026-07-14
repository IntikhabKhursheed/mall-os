const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getSummary, getNotifications } = require("../controllers/analyticsController");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin", "manager"));

router.get("/summary", getSummary);
router.get("/notifications", getNotifications);

module.exports = router;
