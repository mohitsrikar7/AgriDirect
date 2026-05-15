/**
 * Maps master product display names → exact data.gov.in API commodity names.
 * These must match EXACTLY what the API returns in the "commodity" field.
 */

export const MANDI_COMMODITY_MAP = {
  // ── Vegetables ──────────────────────────────────
  "Amaranthus":       "Amaranthus",
  "Beetroot":         "Beetroot",
  "Bitter Gourd":     "Bitter gourd",
  "Bottle Gourd":     "Bottle gourd",
  "Brinjal":          "Brinjal",
  "Cabbage":          "Cabbage",
  "Capsicum":         "Capsicum",
  "Carrot":           "Carrot",
  "Cauliflower":      "Cauliflower",
  "Cluster Beans":    "Cluster beans",
  "Coriander Leaves": "Coriander(Leaves)",
  "Cucumber":         "Cucumbar(Kheera)",
  "Drumstick":        "Drumstick",
  "Garlic":           "Garlic",
  "Ginger":           "Ginger(Green)",
  "Green Chilli":     "Green Chilli",
  "Green Peas":       "Green Peas",
  "Ladies Finger":    "Ladies Finger",
  "Methi Leaves":     "Methi(Leaves)",
  "Mint":             "Mint(Pudina)",
  "Mushroom":         "Mashrooms",
  "Onion":            "Onion",
  "Pointed Gourd":    "Pointed gourd(Parval)",
  "Potato":           "Potato",
  "Pumpkin":          "Pumpkin",
  "Radish":           "Raddish",
  "Ridge Gourd":      "Ridgeguard(Tori)",
  "Snake Gourd":      "Snakeguard",
  "Spinach":          "Spinach",
  "Sponge Gourd":     "Sponge gourd",
  "Sweet Potato":     "Sweet Potato",
  "Tinda":            "Tinda",
  "Tomato":           "Tomato",
  "Turnip":           "Turnip",

  // ── Fruits ──────────────────────────────────────
  "Amla":             "Amla(Nelli Kai)",
  "Apple":            "Apple",
  "Banana":           "Banana",
  "Custard Apple":    "Custard Apple(Sharifa)",
  "Grapes":           "Grapes",
  "Guava":            "Guava",
  "Lemon":            "Lemon",
  "Mango":            "Mango",
  "Muskmelon":        "Karbuja(Musk Melon)",
  "Orange":           "Orange",
  "Papaya":           "Papaya",
  "Pineapple":        "Pineapple",
  "Pomegranate":      "Pomegranate",
  "Sapota":           "Chikoos(Sapota)",
  "Watermelon":       "Water Melon",
};

// Safe helper — returns API commodity name or null
export const getMandiCommodity = (productName) => {
  if (!productName) return null;
  return MANDI_COMMODITY_MAP[productName] || null;
};