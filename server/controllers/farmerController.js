const Product = require("../models/Product");
const MasterProduct = require("../models/MasterProduct");
const axios = require("axios");

// ✅ ADD PRODUCT (FARMER ONLY)
exports.addProduct = async (req, res) => {
  try {
    const { masterProduct, totalValue, quantity } = req.body;

    const totalValueNumber = Number(totalValue);
const quantityNumber = Number(quantity);

if (isNaN(totalValueNumber) || totalValueNumber < 10) {
  return res.status(400).json({ message: "Invalid total value" });
}

if (isNaN(quantityNumber) || quantityNumber < 1) {
  return res.status(400).json({ message: "Invalid quantity" });
}

    const master = await MasterProduct.findById(masterProduct);
    if (!master) {
      return res.status(404).json({
        message: "Invalid master product selected",
      });
    }

    // 🔥 Calculate fixed price per kg ONCE
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
      initialQuantity: quantity,
      pricePerKg,
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });

  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({
      message: "Server error while adding product",
      error: error.message,
    });
  }
};




// ✅ GET FARMER PRODUCTS
exports.getMyProducts = async (req, res) => {
  try {
const products = await Product.find({
  farmer: req.user.id,
  isActive: true,
}).populate("masterProduct");


    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch farmer products",
      error: error.message,
    });
  }
};

// ✅ DELETE PRODUCT (ONLY OWNER FARMER)
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
        runValidators: false, // 🔥 IMPORTANT
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};



// ✅ UPDATE PRODUCT (PRICE / QUANTITY ONLY)
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

    // 🔥 Recalculate pricePerKg correctly
    product.pricePerKg = product.totalValue / product.quantity;

    await product.save();

    res.json({
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};


const User = require("../models/User");

exports.updateFarmerLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const user = await User.findById(req.user.id);

    user.location = { latitude, longitude };
    await user.save();

    res.json({ message: "Farmer location updated" });
  } catch (error) {
     console.error("DELETE ERROR:", error); // ADD THIS LINE
    res.status(500).json({
      message: "Failed to update location",
      error: error.message,
    });
  }
};

// ✅ AI CROP RECOMMENDATION (ML Service)
exports.getAICropRecommendation = async (req, res) => {
  try {
    const {
      avgTemperature5Days,
      avgHumidity5Days,
      totalRainfall5Days,
      soilType,
    } = req.body;

    // 🔥 Call Python ML service
    const response = await axios.post(
      "http://127.0.0.1:8000/predict",
      {
        temperature: avgTemperature5Days,
        humidity: avgHumidity5Days,
        rainfall: totalRainfall5Days,
        soilType: soilType,
      }
    );

    return res.json(response.data);

  } catch (error) {
    console.error("AI Prediction Error:", error.message);
    return res.status(500).json({
      message: "AI crop prediction failed",
      error: error.message,
    });
  }
};