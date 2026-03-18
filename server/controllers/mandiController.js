const axios = require("axios");

const API_KEY = process.env.DATA_GOV_API_KEY;
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";

const getMandiPrices = async (req, res) => {
  try {
    const { state, commodity, variety } = req.query;

    let url = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=500`;

    if (state) {
      url += `&filters[state.keyword]=${encodeURIComponent(state)}`;
    }

    if (commodity) {
      url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
    }

    if (variety) {
      url += `&filters[variety]=${encodeURIComponent(variety)}`;
    }

    const response = await axios.get(url);

    const records = response.data.records || [];

    if (records.length === 0) {
      return res.json({
        message: "No mandi data available",
        records: []
      });
    }

    // Convert modal_price to numbers
    const processed = records.map((r) => ({
      ...r,
      modal_price: Number(r.modal_price),
      min_price: Number(r.min_price),
      max_price: Number(r.max_price),
    }));

    // Sort by modal price descending
    processed.sort((a, b) => b.modal_price - a.modal_price);

    const bestMarket = processed[0];
    const lowestMarket = processed[processed.length - 1];

    const averagePrice =
      processed.reduce((sum, r) => sum + r.modal_price, 0) /
      processed.length;

    const priceSpread =
      bestMarket.modal_price - lowestMarket.modal_price;

    res.json({
      bestMarket: {
        market: bestMarket.market,
        district: bestMarket.district,
        modal_price: bestMarket.modal_price,
      },
      lowestMarket: {
        market: lowestMarket.market,
        modal_price: lowestMarket.modal_price,
      },
      averagePrice: Math.round(averagePrice),
      priceSpread,
      totalMarkets: processed.length,
      records: processed,
    });

  } catch (error) {
    console.error("Mandi API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Error fetching mandi data" });
  }
};

module.exports = { getMandiPrices };