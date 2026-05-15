const Product = require("../models/Product");
const MasterProduct = require("../models/MasterProduct");
const User = require("../models/User");
const { buildCropAdvice } = require("../services/cropAdvisorService");
const { SOIL_TYPES, SEASONS, IRRIGATION_TYPES } = require("../services/cropAdvisorService");

// ADD PRODUCT (FARMER ONLY)
exports.addProduct = async (req, res) => {
  try {
    const { masterProduct, totalValue, quantity } = req.body;

    const totalValueNumber = Number(totalValue);
    const quantityNumber = Number(quantity);

    if (Number.isNaN(totalValueNumber) || totalValueNumber < 10) {
      return res.status(400).json({ message: "Invalid total value" });
    }

    if (Number.isNaN(quantityNumber) || quantityNumber < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const master = await MasterProduct.findById(masterProduct);
    if (!master) {
      return res.status(404).json({
        message: "Invalid master product selected",
      });
    }

    const pricePerKg = Number((totalValueNumber / quantityNumber).toFixed(2));

    const existingProduct = await Product.findOne({
      farmer: req.user.id,
      masterProduct,
      isActive: true,
    });

    if (existingProduct) {
      existingProduct.totalValue = totalValueNumber;
      existingProduct.quantity = quantityNumber;
      existingProduct.pricePerKg = pricePerKg;

      await existingProduct.save();

      return res.status(200).json({
        message: "Product updated successfully",
        product: existingProduct,
      });
    }

    const product = await Product.create({
      farmer: req.user.id,
      masterProduct,
      totalValue: totalValueNumber,
      quantity: quantityNumber,
      initialQuantity: quantityNumber,
      pricePerKg,
    });

    return res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add product error:", error);
    return res.status(500).json({
      message: "Server error while adding product",
      error: error.message,
    });
  }
};

// GET FARMER PRODUCTS
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      farmer: req.user.id,
      isActive: true,
    }).populate("masterProduct");

    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch farmer products",
      error: error.message,
    });
  }
};

// DELETE PRODUCT (ONLY OWNER FARMER)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        farmer: req.user.id,
      },
      {
        isActive: false,
      },
      {
        new: true,
        runValidators: false,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// UPDATE PRODUCT (PRICE / QUANTITY ONLY)
exports.updateProduct = async (req, res) => {
  try {
    const { totalValue, quantity } = req.body;

    const product = await Product.findOne({
      _id: req.params.id,
      farmer: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (totalValue !== undefined) {
      product.totalValue = Number(totalValue);
    }

    if (quantity !== undefined) {
      product.quantity = Number(quantity);
    }

    product.pricePerKg = product.totalValue / product.quantity;

    await product.save();

    return res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

exports.updateFarmerLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const user = await User.findById(req.user.id);
    user.location = { latitude, longitude };
    await user.save();

    return res.json({ message: "Farmer location updated" });
  } catch (error) {
    console.error("UPDATE LOCATION ERROR:", error);
    return res.status(500).json({
      message: "Failed to update location",
      error: error.message,
    });
  }
};

exports.saveAdvisorProfile = async (req, res) => {
  try {
    const soilType = String(req.body?.soilType || "").trim().toLowerCase();
    const irrigation = String(req.body?.irrigation || "").trim().toLowerCase();
    const season = String(req.body?.season || "").trim().toLowerCase();
    const soilPh = Number(req.body?.soilPh);

    if (!SOIL_TYPES.includes(soilType)) {
      return res.status(400).json({ message: "Valid soil type is required" });
    }

    if (!Number.isFinite(soilPh) || soilPh < 3.5 || soilPh > 10) {
      return res.status(400).json({ message: "Valid soil pH is required" });
    }

    if (!IRRIGATION_TYPES.includes(irrigation)) {
      return res.status(400).json({ message: "Valid irrigation level is required" });
    }

    if (!SEASONS.includes(season)) {
      return res.status(400).json({ message: "Valid season is required" });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.advisoryProfile = {
      soilType,
      soilPh: Number(soilPh.toFixed(1)),
      irrigation,
      season,
      lastUpdatedAt: new Date(),
    };

    await user.save();

    return res.json({
      message: "Advisor profile saved",
      advisoryProfile: user.advisoryProfile,
    });
  } catch (error) {
    console.error("SAVE ADVISOR PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to save advisor profile",
      error: error.message,
    });
  }
};

exports.getAdvisorProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("advisoryProfile");

    return res.json({
      advisoryProfile: user?.advisoryProfile || null,
    });
  } catch (error) {
    console.error("GET ADVISOR PROFILE ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch advisor profile",
      error: error.message,
    });
  }
};

// AI CROP ADVISOR
exports.getAICropRecommendation = async (req, res) => {
  try {
    const advice = await buildCropAdvice({
      userId: req.user.id,
      payload: req.body,
    });

    if (!advice.recommendations.length) {
      return res.status(404).json({
        message: "No supported crops are available for advisory right now",
      });
    }

    return res.json(advice);
  } catch (error) {
    console.error("Crop advisor error:", error.message);
    const statusCode =
      error.message?.includes("required") || error.message?.includes("invalid") ? 400 : 500;

    return res.status(statusCode).json({
      message: "Crop advisor failed",
      error: error.message,
    });
  }
};
