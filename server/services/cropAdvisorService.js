const MasterProduct = require("../models/MasterProduct");
const Product = require("../models/Product");
const User = require("../models/User");
const axios = require("axios");
const { CROP_ADVISORY_RULES } = require("../data/cropAdvisoryRules");

const SOIL_TYPES = ["sandy", "laterite", "red", "loamy", "alluvial", "clay", "black"];
const SEASONS = ["kharif", "rabi", "zaid"];
const IRRIGATION_TYPES = ["low", "medium", "high"];
const DATA_GOV_API_KEY = process.env.DATA_GOV_API_KEY;
const DATA_GOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const MARKET_SCORE_MAX = 10;
const MANDI_COMMODITY_MAP = {
  Amaranthus: "Amaranthus",
  Apple: "Apple",
  Banana: "Banana",
  Beetroot: "Beetroot",
  "Bitter Gourd": "Bitter gourd",
  "Bottle Gourd": "Bottle gourd",
  Brinjal: "Brinjal",
  Cabbage: "Cabbage",
  Capsicum: "Capsicum",
  Carrot: "Carrot",
  Cauliflower: "Cauliflower",
  "Cluster Beans": "Cluster beans",
  "Coriander Leaves": "Coriander(Leaves)",
  Cucumber: "Cucumbar(Kheera)",
  Drumstick: "Drumstick",
  Garlic: "Garlic",
  Ginger: "Ginger(Green)",
  "Green Chilli": "Green Chilli",
  "Green Peas": "Green Peas",
  Guava: "Guava",
  "Ladies Finger": "Ladies Finger",
  Lemon: "Lemon",
  Mango: "Mango",
  Onion: "Onion",
  Papaya: "Papaya",
  Potato: "Potato",
  Pumpkin: "Pumpkin",
  Radish: "Raddish",
  "Ridge Gourd": "Ridgeguard(Tori)",
  Spinach: "Spinach",
  "Sweet Potato": "Sweet Potato",
  Tinda: "Tinda",
  Tomato: "Tomato",
  Turnip: "Turnip",
};

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeSeason(season) {
  const normalized = normalizeText(season);
  if (SEASONS.includes(normalized)) return normalized;

  const month = new Date().getMonth() + 1;
  if (month >= 7 && month <= 10) return "kharif";
  if (month >= 11 || month <= 3) return "rabi";
  return "zaid";
}

function compareIrrigation(required, available) {
  const requiredIndex = IRRIGATION_TYPES.indexOf(required);
  const availableIndex = IRRIGATION_TYPES.indexOf(available);

  if (requiredIndex === -1 || availableIndex === -1) return 0;
  if (availableIndex >= requiredIndex) return 15;
  if (availableIndex + 1 === requiredIndex) return 8;
  return 0;
}

function scoreRange(value, min, max, fullScore) {
  if (value >= min && value <= max) return fullScore;

  const margin = (max - min) * 0.15 || 1;
  if (value >= min - margin && value <= max + margin) {
    return Math.round(fullScore * 0.5);
  }

  return 0;
}

function buildReasons(rule, input, weather, alreadyListed) {
  const reasons = [];

  reasons.push(`Matches ${input.soilType} soil preference.`);

  if (input.ph >= rule.phRange[0] && input.ph <= rule.phRange[1]) {
    reasons.push(`Soil pH ${input.ph} fits the preferred ${rule.phRange[0]}-${rule.phRange[1]} range.`);
  }

  if (rule.seasons.includes(input.season)) {
    reasons.push(`Suitable for the ${input.season} season.`);
  }

  if (compareIrrigation(rule.irrigation, input.irrigation) >= 15) {
    reasons.push(`Your ${input.irrigation} irrigation level supports this crop.`);
  }

  if (
    weather.avgTemperature5Days >= rule.temperatureRange[0] &&
    weather.avgTemperature5Days <= rule.temperatureRange[1]
  ) {
    reasons.push(`5-day average temperature is favorable at ${weather.avgTemperature5Days}°C.`);
  }

  if (alreadyListed) {
    reasons.push("You already trade this crop, so existing experience can reduce adoption risk.");
  }

  return reasons.slice(0, 4);
}

function buildCautions(rule, input, weather) {
  const cautions = [];

  if (input.ph < rule.phRange[0] || input.ph > rule.phRange[1]) {
    cautions.push(`pH is outside the ideal ${rule.phRange[0]}-${rule.phRange[1]} range.`);
  }

  if (!rule.seasons.includes(input.season)) {
    cautions.push(`This is not a primary ${input.season} season crop.`);
  }

  if (compareIrrigation(rule.irrigation, input.irrigation) === 0) {
    cautions.push(`Needs ${rule.irrigation} irrigation support.`);
  }

  if (
    weather.totalRainfall5Days < rule.rainfallRange[0] ||
    weather.totalRainfall5Days > rule.rainfallRange[1]
  ) {
    cautions.push("Upcoming rainfall is outside the preferred range.");
  }

  return cautions.slice(0, 3);
}

function scoreCrop(rule, input, weather, alreadyListed) {
  let score = 0;

  if (rule.soilTypes.includes(input.soilType)) {
    score += 30;
  }

  score += scoreRange(input.ph, rule.phRange[0], rule.phRange[1], 20);

  if (rule.seasons.includes(input.season)) {
    score += 15;
  }

  score += compareIrrigation(rule.irrigation, input.irrigation);
  score += scoreRange(weather.avgTemperature5Days, rule.temperatureRange[0], rule.temperatureRange[1], 10);
  score += scoreRange(weather.avgHumidity5Days, rule.humidityRange[0], rule.humidityRange[1], 5);
  score += scoreRange(weather.totalRainfall5Days, rule.rainfallRange[0], rule.rainfallRange[1], 5);

  if (alreadyListed) {
    score += 5;
  }

  return clamp(score, 0, 100);
}

function getPreferredState(user, payloadState) {
  const explicitState = String(payloadState || "").trim();
  if (explicitState) return explicitState;

  const secondaryAddress = user?.addresses?.find((item) => item.label === "secondary");
  const primaryAddress = user?.addresses?.find((item) => item.label === "primary");
  return secondaryAddress?.state || primaryAddress?.state || "";
}

async function fetchMarketSnapshot(productName, state) {
  const commodity = MANDI_COMMODITY_MAP[productName];
  if (!commodity || !state || !DATA_GOV_API_KEY) {
    return {
      score: 0,
      marketAvailable: false,
      reason: "Market data unavailable for this crop/state combination.",
      averagePrice: null,
      bestMarket: null,
      commodity: commodity || null,
      state: state || null,
    };
  }

  try {
    const response = await axios.get(`https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`, {
      timeout: 10000,
      params: {
        "api-key": DATA_GOV_API_KEY,
        format: "json",
        limit: 100,
        "filters[commodity]": commodity,
        "filters[state]": state,
      },
    });

    const records = Array.isArray(response.data?.records) ? response.data.records : [];
    const prices = records
      .map((record) => ({
        ...record,
        modal_price: Number(record.modal_price) || 0,
      }))
      .filter((record) => record.modal_price > 0);

    if (!prices.length) {
      return {
        score: 0,
        marketAvailable: false,
        reason: "No valid mandi price data found for this crop in the selected state.",
        averagePrice: null,
        bestMarket: null,
        commodity,
        state,
      };
    }

    prices.sort((a, b) => b.modal_price - a.modal_price);
    const averagePrice = prices.reduce((sum, item) => sum + item.modal_price, 0) / prices.length;
    const marketScore = clamp(Math.round((averagePrice / 7000) * MARKET_SCORE_MAX), 1, MARKET_SCORE_MAX);

    return {
      score: marketScore,
      marketAvailable: true,
      reason: `Average mandi price is Rs ${Math.round(averagePrice)} in ${state}.`,
      averagePrice: Math.round(averagePrice),
      bestMarket: prices[0]
        ? {
            market: prices[0].market,
            district: prices[0].district,
            modal_price: prices[0].modal_price,
          }
        : null,
      commodity,
      state,
    };
  } catch (error) {
    return {
      score: 0,
      marketAvailable: false,
      reason: "Market feed could not be reached, so this ranking uses suitability only.",
      averagePrice: null,
      bestMarket: null,
      commodity,
      state,
    };
  }
}

function validateInput(payload) {
  const soilType = normalizeText(payload.soilType);
  const irrigation = normalizeText(payload.irrigation);
  const season = normalizeSeason(payload.season);
  const ph = Number(payload.ph);
  const avgTemperature5Days = Number(payload.avgTemperature5Days);
  const avgHumidity5Days = Number(payload.avgHumidity5Days);
  const totalRainfall5Days = Number(payload.totalRainfall5Days);

  if (!SOIL_TYPES.includes(soilType)) {
    throw new Error("Valid soil type is required.");
  }

  if (!Number.isFinite(ph) || ph < 3.5 || ph > 10) {
    throw new Error("Valid soil pH is required.");
  }

  if (!IRRIGATION_TYPES.includes(irrigation)) {
    throw new Error("Valid irrigation level is required.");
  }

  if (![avgTemperature5Days, avgHumidity5Days, totalRainfall5Days].every(Number.isFinite)) {
    throw new Error("Weather inputs are missing or invalid.");
  }

  return {
    soilType,
    ph: Number(ph.toFixed(1)),
    irrigation,
    season,
    avgTemperature5Days: Number(avgTemperature5Days.toFixed(2)),
    avgHumidity5Days: Number(avgHumidity5Days.toFixed(2)),
    totalRainfall5Days: Number(totalRainfall5Days.toFixed(2)),
  };
}

function buildWhyTopSummary(recommendations) {
  if (!recommendations.length) return null;

  const [top, second] = recommendations;
  if (!second) {
    return `${top.crop} is the leading recommendation because it best matches the current farm inputs and available market signals.`;
  }

  const scoreGap = top.score - second.score;
  const advantages = [];

  if (top.suitabilityScore > second.suitabilityScore) {
    advantages.push(`stronger farm-fit score (${top.suitabilityScore} vs ${second.suitabilityScore})`);
  }

  if (top.marketScore > second.marketScore) {
    advantages.push(`better market bonus (+${top.marketScore} vs +${second.marketScore})`);
  }

  if (top.alreadyListed && !second.alreadyListed) {
    advantages.push("lower adoption risk because you already list it");
  }

  const summaryTail = advantages.length
    ? ` It outranked ${second.crop} mainly due to ${advantages.join(" and ")}.`
    : ` It stayed ahead of ${second.crop} by ${scoreGap} points overall.`;

  return `${top.crop} is the top recommendation with a total score of ${top.score}/100.${summaryTail}`;
}

function buildAdvisorHighlights(recommendations) {
  if (!recommendations.length) return [];

  const top = recommendations[0];
  const highlights = [
    `${top.crop} leads with ${top.score}/100, combining agronomic fit and current market conditions.`,
  ];

  if (top.marketInsights?.marketAvailable) {
    highlights.push(
      `${top.crop} also benefits from mandi support in ${top.marketInsights.state}, with an average price near Rs ${top.marketInsights.averagePrice}.`
    );
  }

  const weakMarket = recommendations.find((item) => !item.marketInsights?.marketAvailable);
  if (weakMarket) {
    highlights.push(`Some crops, like ${weakMarket.crop}, are ranked mostly on farm suitability because market data is limited.`);
  }

  return highlights.slice(0, 3);
}

async function buildCropAdvice({ userId, payload }) {
  const input = validateInput(payload);
  const allowedNames = Object.keys(CROP_ADVISORY_RULES);

  const [masterProducts, activeListings, user] = await Promise.all([
    MasterProduct.find({ name: { $in: allowedNames } }).lean(),
    Product.find({ farmer: userId, isActive: true }).populate("masterProduct", "name").lean(),
    User.findById(userId).select("addresses").lean(),
  ]);
  const preferredState = getPreferredState(user, payload?.state);

  const listedNames = new Set(
    activeListings
      .map((item) => item.masterProduct?.name)
      .filter(Boolean)
  );

  const recommendations = await Promise.all(
    masterProducts.map(async (product) => {
      const rule = CROP_ADVISORY_RULES[product.name];
      if (!rule) return null;

      const weather = {
        avgTemperature5Days: input.avgTemperature5Days,
        avgHumidity5Days: input.avgHumidity5Days,
        totalRainfall5Days: input.totalRainfall5Days,
      };
      const alreadyListed = listedNames.has(product.name);
      const suitabilityScore = scoreCrop(rule, input, weather, alreadyListed);
      const market = await fetchMarketSnapshot(product.name, preferredState);
      const score = clamp(suitabilityScore + market.score, 0, 100);
      const reasons = buildReasons(rule, input, weather, alreadyListed);
      if (market.marketAvailable) {
        reasons.push(market.reason);
      }
      const cautions = buildCautions(rule, input, weather);
      if (!market.marketAvailable) {
        cautions.push(market.reason);
      }

      return {
        crop: product.name,
        productId: String(product._id),
        category: product.category,
        unit: product.unit,
        score,
        suitabilityScore,
        marketScore: market.score,
        confidence: Number((score / 100).toFixed(2)),
        reasons,
        cautions,
        alreadyListed,
        cropProfile: {
          irrigation: rule.irrigation,
          durationDays: rule.durationDays,
          idealPhRange: rule.phRange,
          preferredSeasons: rule.seasons,
        },
        marketInsights: {
          marketAvailable: market.marketAvailable,
          state: market.state,
          commodity: market.commodity,
          averagePrice: market.averagePrice,
          bestMarket: market.bestMarket,
        },
      };
    })
  );

  const finalRecommendations = recommendations.filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 5);

  return {
    input,
    marketContext: {
      state: preferredState || null,
      weightedMarketScoreMax: MARKET_SCORE_MAX,
    },
    recommendationBasis: "hybrid_rule_engine",
    whyTopRecommendation: buildWhyTopSummary(finalRecommendations),
    advisorHighlights: buildAdvisorHighlights(finalRecommendations),
    recommendations: finalRecommendations,
  };
}

module.exports = {
  buildCropAdvice,
  SOIL_TYPES,
  SEASONS,
  IRRIGATION_TYPES,
};
