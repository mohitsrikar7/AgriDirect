const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      enum: ["farmer", "customer", "admin"],
      default: ["customer"],
    },
    
addresses: [
  {
    type: {
      type: String,
      enum: ["home", "farm"], // What kind of address
      required: true,
    },
    label: {
      type: String,
      enum: ["primary", "secondary"],
      default: "primary",
    },
    isActive: {
      type: Boolean,
      default: false,
    },

    fullName: String,
    phone: String,
    house: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    latitude: Number,
    longitude: Number,
  },
],
 // optional general location
    location: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
