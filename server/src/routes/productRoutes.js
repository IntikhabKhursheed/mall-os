const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const router = express.Router();

router.use(authMiddleware, roleMiddleware("admin", "manager"));
router.get("/", listProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
