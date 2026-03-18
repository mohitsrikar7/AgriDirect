const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const mongoose = require("mongoose");

// ✅ GET ALL PRODUCTS (GROUPED BY MASTER PRODUCT)
exports.getAllProducts = async (req, res) => {
  try {
    const groupedProducts = await Product.aggregate([
      {
        $match: { isActive: true }
      },

      {
        $group: {
          _id: "$masterProduct",
          minPrice: { $min: "$pricePerKg" },  // 🔥 FIXED
          sellerCount: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" }
        }
      },

      {
        $lookup: {
          from: "masterproducts",
          localField: "_id",
          foreignField: "_id",
          as: "masterProduct"
        }
      },

      { $unwind: "$masterProduct" },

      {
        $project: {
          _id: 0,
          masterProductId: "$masterProduct._id",
          name: "$masterProduct.name",
          category: "$masterProduct.category",
          unit: "$masterProduct.unit",
          image: "$masterProduct.image",
          minPrice: { $round: ["$minPrice", 2] },
          sellerCount: 1,
          totalQuantity: 1
        }
      },

      { $sort: { name: 1 } }
    ]);


    res.json(groupedProducts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch grouped products",
      error: error.message,
    });
  }
};

exports.getProductSellers = async (req, res) => {
  try {
    const { masterProductId } = req.params;

    const customer = await User.findById(req.user.id);

    const sellers = await Product.find({
      masterProduct: masterProductId,
      quantity: { $gt: 0 },   // 🔥 only sellers with stock
      isActive: true          // 🔥 only active products
    })
      .populate("farmer")
      .populate("masterProduct");

    const sellersWithDistance = sellers.map((seller) => {
      let distance = null;

      if (
        customer?.location?.latitude &&
        customer?.location?.longitude &&
        seller?.farmer?.location?.latitude &&
        seller?.farmer?.location?.longitude
      ) {
        distance = calculateDistance(
          customer.location.latitude,
          customer.location.longitude,
          seller.farmer.location.latitude,
          seller.farmer.location.longitude
        );
      }

      return {
        ...seller.toObject(),
        distance: distance !== null ? Number(distance.toFixed(2)) : null,
      };
    });

    // 🔥 Sort by nearest
    sellersWithDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    res.json(sellersWithDistance);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch sellers",
      error: error.message,
    });
  }
};



// ✅ GET CUSTOMER ORDERS (WITH MASTER PRODUCT POPULATION)
exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate({
        path: "items.product",
        populate: {
          path: "masterProduct",
          model: "MasterProduct",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customer orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Customer orders error:", error);
    res.status(500).json({
      message: "Server error while fetching orders",
      error: error.message,
    });
  }
};



exports.updateAddress = async (req, res) => {
  try {
    const {
      type,
      fullName,
      phone,
      house,
      area,
      city,
      state,
      pincode,
      latitude,
      longitude,
    } = req.body;

    if (!["home", "farm"].includes(type)) {
      return res.status(400).json({ message: "Invalid address type" });
    }

    // Remove only same type + same label
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { addresses: { type, label: req.body.label } },
    });

    const newAddress = {
      type,
      label: req.body.label,
      isActive: true,
      fullName,
      phone,
      house,
      area,
      city,
      state,
      pincode,
      latitude,
      longitude,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $push: { addresses: newAddress },
        ...(type === "home" && latitude && longitude
          ? { location: { latitude, longitude } }
          : {}),
      },
      { new: true }
    );

    res.json({
      message: `${type} address saved successfully`,
      addresses: updatedUser.addresses,
    });

  } catch (error) {
    console.error("Address update error:", error);
    res.status(500).json({
      message: "Failed to update address",
      error: error.message,
    });
  }
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
