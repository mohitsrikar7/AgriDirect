const express = require("express");
const router = express.Router();
const {
  getAnalytics,
  getAllOrders,
  getTotalSales,
  getFarmerSales,
  updateOrderStatus,
  markOrderDelivered,
  getPlatformStats,
  getTopProducts,
  getAllUsers,
  getRecentActivity,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Admin routes
router.get("/orders", protect, authorize("admin"), getAllOrders);
router.get("/sales", protect, authorize("admin"), getTotalSales);
router.get("/farmer-sales", protect, authorize("admin"), getFarmerSales);
router.get("/analytics", protect, authorize("admin"), getAnalytics);
router.get("/platform-stats", protect, authorize("admin"), getPlatformStats);
router.get("/top-products", protect, authorize("admin"), getTopProducts);
router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/recent-activity", protect, authorize("admin"), getRecentActivity);
router.put(
  "/order/:orderId/status",
  protect,
  authorize("admin"),
  updateOrderStatus
);
// Mark order as delivered (handles COD payment update)
router.put(
  "/order/:orderId/deliver",
  protect,
  authorize("admin"),
  markOrderDelivered
);
module.exports = router;
