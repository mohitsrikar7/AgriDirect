const axios = require("axios");

const API_KEY = process.env.DATA_GOV_API_KEY;
const RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const CACHE_TTL_MS = 10 * 60 * 1000;
const RATE_LIMIT_COOLDOWN_MS = 2 * 60 * 1000;
const mandiCache = new Map();
let rateLimitedUntil = 0;

const getCacheKey = ({ state, commodity, variety }) =>
  `${String(state || "").trim().toLowerCase()}::${String(commodity || "").trim().toLowerCase()}::${String(variety || "").trim().toLowerCase()}`;

const fallbackPayload = (message = "Mandi data unavailable", usedFallback = true) => ({
  bestMarket: null,
  lowestMarket: null,
  averagePrice: 0,
  priceSpread: 0,
  totalMarkets: 0,
  records: [],
  usedFallback,
  message,
});

const getMandiPrices = async (req, res) => {
  let usedFallback = false;
  try {
    const { state, commodity, variety } = req.query;
    const cacheKey = getCacheKey({ state, commodity, variety });
    const now = Date.now();
    const cachedEntry = mandiCache.get(cacheKey);

    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL_MS) {
      return res.json(cachedEntry.data);
    }

    if (rateLimitedUntil > now) {
      if (cachedEntry) return res.json(cachedEntry.data);
      return res.json(
        fallbackPayload("Mandi provider is rate-limited. Please retry in a minute.", true)
      );
    }

    if (!API_KEY) {
      return res.json(fallbackPayload("Mandi API key missing", true));
    }

    // Build server-side filters for data.gov.in API
    const filters = {};
    if (commodity && typeof commodity === "string" && commodity.trim()) {
      filters["filters[commodity]"] = commodity.trim();
    }
    if (state && typeof state === "string" && state.trim()) {
      filters["filters[state]"] = state.trim();
    }

    let allRecords = [];
    let offset = 0;
    const limit = 500;

    // Fetch up to 3 pages (1500 records max) using server-side filters
    for (let i = 0; i < 3; i++) {
      const url = `https://api.data.gov.in/resource/${RESOURCE_ID}`;
      const response = await axios.get(url, {
        timeout: 10000,
        params: {
          "api-key": API_KEY,
          format: "json",
          limit,
          offset,
          ...filters,
        },
      });

      const rawRecords = response?.data?.records;
      const records = Array.isArray(rawRecords) ? rawRecords : [];

      if (records.length === 0) break;

      allRecords = [...allRecords, ...records];

      // If we got fewer records than the limit, we've fetched everything
      if (records.length < limit) break;
      offset += limit;
    }

    if (allRecords.length === 0) {
      usedFallback = false;
      const responseData = fallbackPayload("No mandi data available for selected filters", usedFallback);
      mandiCache.set(cacheKey, { timestamp: now, data: responseData });
      return res.json(responseData);
    }

    const records = allRecords;

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
      const responseData = {
        ...fallbackPayload("No valid modal prices in selected data", true),
        totalMarkets: processed.length,
        records: processed,
      };
      mandiCache.set(cacheKey, { timestamp: now, data: responseData });
      return res.json(responseData);
    }

    validPrices.sort((a, b) => b.modal_price - a.modal_price);

    const bestMarket = validPrices[0];
    const lowestMarket = validPrices[validPrices.length - 1];

    const averagePrice = validPrices.length > 0
      ? validPrices.reduce((sum, r) => sum + r.modal_price, 0) / validPrices.length
      : 0;

    const priceSpread =
      bestMarket.modal_price - lowestMarket.modal_price;

    const responseData = {
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
    };
    mandiCache.set(cacheKey, { timestamp: now, data: responseData });
    res.json(responseData);

  } catch (error) {
    usedFallback = true;
    const status = error?.response?.status;
    if (status === 429) {
      rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    }
    console.error("Mandi API Error:", error.response?.data || error.message);
    return res.json(fallbackPayload("Mandi data unavailable", usedFallback));
  }
};

module.exports = { getMandiPrices };
