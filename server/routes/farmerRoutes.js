const express = require("express");
const router = express.Router();

const {
  addProduct,
  getMyProducts,
  deleteProduct,
  updateProduct,
  updateFarmerLocation,
  getAICropRecommendation,
} = require("../controllers/farmerController");

const { protect, authorize } = require("../middleware/authMiddleware");
const { getWeatherByLocation } = require("../controllers/weatherController");
const { getCropRecommendation } = require("../controllers/cropController");
const { getMandiPrices } = require("../controllers/mandiController");

// ADD PRODUCT
router.post("/add-product", protect, authorize("farmer"), addProduct);

// GET FARMER PRODUCTS
router.get("/my-products", protect, authorize("farmer"), getMyProducts);

// ✅ DELETE PRODUCT (FIX)
router.delete(
  "/product/:id",
  protect,
  authorize("farmer"),
  deleteProduct
);

// WEATHER
router.get(
  "/weather",
  protect,
  authorize("farmer"),
  getWeatherByLocation
);

// CROP RECOMMENDATION
router.get(
  "/crop-recommendation",
  protect,
  authorize("farmer"),
  getCropRecommendation
);

// MANDI PRICES
router.get(
  "/mandi-prices",
  protect,
  authorize("farmer"),
  getMandiPrices
);
router.put(
  "/product/:id",
  protect,
  authorize("farmer"),
  updateProduct
);
router.put(
  "/update-location",
  protect,
  authorize("farmer"),
  updateFarmerLocation
);
// ✅ AI Crop Recommendation
router.post(
  "/ai-crop",
  protect,
  authorize("farmer"),
  getAICropRecommendation
);
module.exports = router;
