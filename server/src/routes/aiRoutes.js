const express = require("express");
const { fetchInsights } = require("../controllers/aiController");

const router = express.Router();

router.post("/insights", fetchInsights);

module.exports = router;
