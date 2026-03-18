const express = require("express");
const { getMandiPrices } = require("../controllers/mandiController");

const router = express.Router();

router.get("/mandi-data", getMandiPrices);

module.exports = router;
