const express = require("express");
const router = express.Router();

const {
  addProduct,
  getMyProducts,
  deleteProduct,
  updateProduct,
  updateFarmerLocation,
  getAICropRecommendation,
  saveAdvisorProfile,
  getAdvisorProfile,
} = require("../controllers/farmerController");

const { protect, authorize } = require("../middleware/authMiddleware");
const { getWeatherByLocation } = require("../controllers/weatherController");
const { getCropRecommendation } = require("../controllers/cropController");
const { getMandiPrices } = require("../controllers/mandiController");

router.post("/add-product", protect, authorize("farmer"), addProduct);
router.get("/my-products", protect, authorize("farmer"), getMyProducts);
router.delete("/product/:id", protect, authorize("farmer"), deleteProduct);
router.get("/weather", protect, authorize("farmer"), getWeatherByLocation);
router.get("/crop-recommendation", protect, authorize("farmer"), getCropRecommendation);
router.get("/mandi-prices", protect, authorize("farmer"), getMandiPrices);
router.put("/product/:id", protect, authorize("farmer"), updateProduct);
router.put("/update-location", protect, authorize("farmer"), updateFarmerLocation);
router.get("/advisor-profile", protect, authorize("farmer"), getAdvisorProfile);
router.put("/advisor-profile", protect, authorize("farmer"), saveAdvisorProfile);
router.post("/ai-crop", protect, authorize("farmer"), getAICropRecommendation);

module.exports = router;
