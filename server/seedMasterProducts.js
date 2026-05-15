/**
 * Seed Master Products — aligned with data.gov.in Mandi API commodities.
 * Uses upsert so existing products (Tomato, Potato, Onion, Apple) keep their images.
 * Run: node seedMasterProducts.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const MasterProduct = require("./models/MasterProduct");

const PRODUCTS = [
  // ── Vegetables ──────────────────────────────────
  { name: "Amaranthus",        category: "Vegetables", unit: "kg" },
  { name: "Beetroot",          category: "Vegetables", unit: "kg" },
  { name: "Bitter Gourd",      category: "Vegetables", unit: "kg" },
  { name: "Bottle Gourd",      category: "Vegetables", unit: "kg" },
  { name: "Brinjal",           category: "Vegetables", unit: "kg" },
  { name: "Cabbage",           category: "Vegetables", unit: "kg" },
  { name: "Capsicum",          category: "Vegetables", unit: "kg" },
  { name: "Carrot",            category: "Vegetables", unit: "kg" },
  { name: "Cauliflower",       category: "Vegetables", unit: "kg" },
  { name: "Cluster Beans",     category: "Vegetables", unit: "kg" },
  { name: "Coriander Leaves",  category: "Vegetables", unit: "kg" },
  { name: "Cucumber",          category: "Vegetables", unit: "kg" },
  { name: "Drumstick",         category: "Vegetables", unit: "kg" },
  { name: "Garlic",            category: "Vegetables", unit: "kg" },
  { name: "Ginger",            category: "Vegetables", unit: "kg" },
  { name: "Green Chilli",      category: "Vegetables", unit: "kg" },
  { name: "Green Peas",        category: "Vegetables", unit: "kg" },
  { name: "Ladies Finger",     category: "Vegetables", unit: "kg" },
  { name: "Methi Leaves",      category: "Vegetables", unit: "kg" },
  { name: "Mint",              category: "Vegetables", unit: "kg" },
  { name: "Mushroom",          category: "Vegetables", unit: "kg" },
  { name: "Onion",             category: "Vegetables", unit: "kg" },
  { name: "Pointed Gourd",     category: "Vegetables", unit: "kg" },
  { name: "Potato",            category: "Vegetables", unit: "kg" },
  { name: "Pumpkin",           category: "Vegetables", unit: "kg" },
  { name: "Radish",            category: "Vegetables", unit: "kg" },
  { name: "Ridge Gourd",       category: "Vegetables", unit: "kg" },
  { name: "Snake Gourd",       category: "Vegetables", unit: "kg" },
  { name: "Spinach",           category: "Vegetables", unit: "kg" },
  { name: "Sponge Gourd",      category: "Vegetables", unit: "kg" },
  { name: "Sweet Potato",      category: "Vegetables", unit: "kg" },
  { name: "Tinda",             category: "Vegetables", unit: "kg" },
  { name: "Tomato",            category: "Vegetables", unit: "kg" },
  { name: "Turnip",            category: "Vegetables", unit: "kg" },

  // ── Fruits ──────────────────────────────────────
  { name: "Amla",              category: "Fruits", unit: "kg" },
  { name: "Apple",             category: "Fruits", unit: "kg" },
  { name: "Banana",            category: "Fruits", unit: "kg" },
  { name: "Custard Apple",     category: "Fruits", unit: "kg" },
  { name: "Grapes",            category: "Fruits", unit: "kg" },
  { name: "Guava",             category: "Fruits", unit: "kg" },
  { name: "Lemon",             category: "Fruits", unit: "kg" },
  { name: "Mango",             category: "Fruits", unit: "kg" },
  { name: "Muskmelon",         category: "Fruits", unit: "kg" },
  { name: "Orange",            category: "Fruits", unit: "kg" },
  { name: "Papaya",            category: "Fruits", unit: "kg" },
  { name: "Pineapple",         category: "Fruits", unit: "kg" },
  { name: "Pomegranate",       category: "Fruits", unit: "kg" },
  { name: "Sapota",            category: "Fruits", unit: "kg" },
  { name: "Watermelon",        category: "Fruits", unit: "kg" },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    let created = 0;
    let skipped = 0;

    for (const product of PRODUCTS) {
      const existing = await MasterProduct.findOne({ name: product.name });

      if (existing) {
        // Update category/unit if needed, but DON'T overwrite image
        existing.category = product.category;
        existing.unit = product.unit;
        await existing.save();
        skipped++;
        console.log(`  ✓ ${product.name} (already exists — updated category/unit)`);
      } else {
        await MasterProduct.create(product);
        created++;
        console.log(`  + ${product.name} (created)`);
      }
    }

    console.log(`\nDone! Created: ${created}, Updated: ${skipped}, Total: ${PRODUCTS.length}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
