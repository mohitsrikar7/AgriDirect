// Maps your product names → Govt API commodity names

export const MANDI_COMMODITY_MAP = {
  Tomato: "Tomato",
  Onion: "Onion",
  Potato: "Potato",
  Rice: "Rice",
  Wheat: "Wheat",
  Maize: "Maize",
  Chili: "Chillies",
  Turmeric: "Turmeric",
  Groundnut: "Groundnut",
};

// Safe helper
export const getMandiCommodity = (productName) => {
  if (!productName) return null;
  return MANDI_COMMODITY_MAP[productName] || null;
};