const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    masterProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterProduct",
      required: true,
    },

    // 🔥 Total listing value (what farmer enters)
    totalValue: {
      type: Number,
      required: true,
      min: [10, "Total value must be at least ₹10"],
      max: [100000, "Total value cannot exceed ₹100000"],
    },

    // 🔥 Fixed price per kg (calculated once)
    pricePerKg: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      max: [100000, "Quantity too large"],
    },

    initialQuantity: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }


);

// Unique active listing per farmer per product
// Only enforce uniqueness for active listings — multiple inactive are allowed
productSchema.index(
  { farmer: 1, masterProduct: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model("Product", productSchema);
