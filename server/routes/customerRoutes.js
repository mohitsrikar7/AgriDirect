const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getCustomerOrders,
  getProductSellers,
  updateAddress,
} = require("../controllers/customerController");

const { protect, authorize } = require("../middleware/authMiddleware");

// PUBLIC PRODUCTS
router.get("/products", getAllProducts);

// SELLERS
router.get(
  "/product/:masterProductId",
  protect,
  authorize("customer"),
  getProductSellers
);

// ORDERS
router.get(
  "/orders",
  protect,
  authorize("customer"),
  getCustomerOrders
);



// UPDATE ADDRESS
router.put(
  "/update-address",
  protect,
  authorize("customer", "farmer"),
  updateAddress
);

module.exports = router;