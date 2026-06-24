const express = require("express");
const { createSale } = require("../controllers/posController");

const router = express.Router();

router.post("/sale", createSale);

module.exports = router;
