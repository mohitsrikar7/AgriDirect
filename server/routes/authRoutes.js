const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { addRole } = require("../controllers/authController");
const { getMe } = require("../controllers/authController");
const { changePassword } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/add-role", protect, addRole);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);
module.exports = router;
