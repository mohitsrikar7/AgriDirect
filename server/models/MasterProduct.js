const mongoose = require("mongoose");

const masterProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    unit: {
      type: String,
      default: "kg",
    },
    image: {
    type: String, // URL or local path
    default: ""
  }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MasterProduct", masterProductSchema);
