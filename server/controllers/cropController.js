exports.getCropRecommendation = async (req, res) => {
  try {
    const { temperature, rainfall, soilType } = req.query;

    let crops = [];

    if (temperature > 25 && rainfall > 50 && soilType === "loamy") {
      crops = ["Rice", "Sugarcane", "Cotton"];
    } 
    else if (temperature > 20 && rainfall < 50 && soilType === "sandy") {
      crops = ["Millet", "Groundnut", "Maize"];
    } 
    else if (temperature < 20 && soilType === "clay") {
      crops = ["Wheat", "Barley", "Mustard"];
    } 
    else {
      crops = ["Tomato", "Onion", "Chilli"];
    }

    res.json({
      temperature,
      rainfall,
      soilType,
      recommendedCrops: crops,
    });
  } catch (error) {
    res.status(500).json({ message: "Crop recommendation failed" });
  }
};
