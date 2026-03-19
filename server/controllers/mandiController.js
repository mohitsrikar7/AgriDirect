const axios = require("axios");

const API_KEY = process.env.DATA_GOV_API_KEY;
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

const getMandiPrices = async (req, res) => {
  let usedFallback = false;
  try {
    const { state, commodity, variety } = req.query;

    let allRecords = [];
    let offset = 0;
    const limit = 100;

    // 🔁 Fetch multiple pages
    for (let i = 0; i < 10; i++) { // fetch up to 1000 records
      const url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=${limit}&offset=${offset}`;

      const response = await axios.get(url, { timeout: 7000 });
      const rawRecords = response?.data?.records;
      const records = Array.isArray(rawRecords) ? rawRecords : [];

      if (records.length === 0) break;

      allRecords = [...allRecords, ...records];
      offset += limit;
    }

    console.log(
      "Matching commodities:",
      allRecords.map((r) => r.commodity).slice(0, 20)
    );

    // 🔥 Now filter manually
    let filtered = allRecords;

    const stateQuery =
      typeof state === "string" ? state.trim().toLowerCase() : "";

    const commodityQuery =
      typeof commodity === "string" ? commodity.trim().toLowerCase() : "";

    if (commodityQuery) {
      filtered = filtered.filter((r) =>
        String(r.commodity || "").toLowerCase().includes(commodityQuery)
      );
    }

    if (stateQuery) {
      filtered = filtered.filter((r) =>
        String(r.state || "").toLowerCase().includes(stateQuery)
      );
    }

    if (filtered.length === 0) {
      usedFallback = false;
      return res.json({
        bestMarket: null,
        lowestMarket: null,
        averagePrice: 0,
        priceSpread: 0,
        totalMarkets: 0,
        records: [],
        usedFallback,
        message: "No mandi data available for selected filters",
      });
    }

    const records = filtered;
    console.log("Total fetched:", allRecords.length);
    console.log("Filtered:", records.length);
    console.log("Filtered records:", records.length);

    if (records.length === 0) {
      usedFallback = true;
      return res.json({
        bestMarket: null,
        lowestMarket: null,
        averagePrice: 0,
        priceSpread: 0,
        totalMarkets: 0,
        records: [],
        usedFallback,
        message: "No mandi data available",
      });
    }

    // Convert modal_price to numbers
    const processed = records.map((r) => ({
      ...r,
      modal_price: Number(r.modal_price) || 0,
      min_price: Number(r.min_price) || 0,
      max_price: Number(r.max_price) || 0,
    }));

    const validPrices = processed.filter(
      (r) => Number(r.modal_price) > 0
    );

    if (validPrices.length === 0) {
      return res.json({
        bestMarket: null,
        lowestMarket: null,
        averagePrice: 0,
        priceSpread: 0,
        totalMarkets: processed.length,
        records: processed,
        usedFallback: true,
        message: "No valid modal prices in selected data",
      });
    }

    validPrices.sort((a, b) => b.modal_price - a.modal_price);

    const bestMarket = validPrices[0];
    const lowestMarket = validPrices[validPrices.length - 1];

    const averagePrice = validPrices.length > 0
      ? validPrices.reduce((sum, r) => sum + r.modal_price, 0) / validPrices.length
      : 0;

    const priceSpread =
      bestMarket.modal_price - lowestMarket.modal_price;

    res.json({
      bestMarket: bestMarket
        ? {
          market: bestMarket.market,
          district: bestMarket.district,
          modal_price: bestMarket.modal_price,
        }
        : null,

      lowestMarket: lowestMarket
        ? {
          market: lowestMarket.market,
          modal_price: lowestMarket.modal_price,
        }
        : null,

      averagePrice: Math.round(averagePrice),
      priceSpread: bestMarket && lowestMarket
        ? bestMarket.modal_price - lowestMarket.modal_price
        : 0,

      totalMarkets: processed.length,
      records: processed,
      usedFallback,
    });

  } catch (error) {
    usedFallback = true;
    console.error("Mandi API Error:", error.response?.data || error.message);

    // ✅ SAFE FALLBACK RESPONSE
    return res.json({
      bestMarket: null,
      lowestMarket: null,
      averagePrice: 0,
      priceSpread: 0,
      totalMarkets: 0,
      records: [],
      usedFallback,
      message: "Mandi data unavailable",
    });
  }
};

module.exports = { getMandiPrices };