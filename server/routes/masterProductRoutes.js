const express = require("express");
const router = express.Router();
const MasterProduct = require("../models/MasterProduct");

router.get("/", async (req, res) => {
  const products = await MasterProduct.find().sort({ name: 1 });
  res.json(products);
});

module.exports = router;
