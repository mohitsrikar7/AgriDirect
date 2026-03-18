const express = require("express");
const router = express.Router();
const { getAllProducts } = require("../controllers/customerController");

router.get("/", getAllProducts);

module.exports = router;