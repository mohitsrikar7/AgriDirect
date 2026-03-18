const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

// Any logged-in user
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

// Farmer only
router.get("/farmer", protect, authorize("farmer"), (req, res) => {
  res.json({ message: "Farmer access granted" });
});

// Admin only
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

module.exports = router;
