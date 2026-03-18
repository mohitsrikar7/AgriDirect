const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getMyOrders,
  updatePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require("../controllers/orderController");

const { protect, authorize } = require("../middleware/authMiddleware");

// 🛒 Customer places order
router.post(
  "/place",
  protect,
  authorize("customer"),
  placeOrder
);

// 📦 Customer order history
router.get(
  "/my-orders",
  protect,
  authorize("customer"),
  getMyOrders
);

// 💳 Update payment method/status
router.put(
  "/:orderId/payment",
  protect,
  authorize("customer"),
  updatePayment
);

// 💳 Create Razorpay order
router.post(
  "/:orderId/razorpay",
  protect,
  authorize("customer"),
  createRazorpayOrder
);

// 💳 Verify Razorpay payment
router.post(
  "/:orderId/razorpay/verify",
  protect,
  authorize("customer"),
  verifyRazorpayPayment
);

module.exports = router;
