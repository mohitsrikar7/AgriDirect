const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

// ──────────────── Platform Stats ────────────────
exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalFarmers, totalCustomers, totalProducts, activeProducts] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ roles: "farmer" }),
        User.countDocuments({ roles: "customer" }),
        Product.countDocuments(),
        Product.countDocuments({ isActive: true }),
      ]);

    res.json({ totalUsers, totalFarmers, totalCustomers, totalProducts, activeProducts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ──────────────── Top Selling Products ────────────────
exports.getTopProducts = async (req, res) => {
  try {
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "masterproducts",
          localField: "product.masterProduct",
          foreignField: "_id",
          as: "masterProduct",
        },
      },
      { $unwind: "$masterProduct" },
      {
        $lookup: {
          from: "users",
          localField: "product.farmer",
          foreignField: "_id",
          as: "farmer",
        },
      },
      { $unwind: "$farmer" },
      {
        $project: {
          productName: "$masterProduct.name",
          category: "$masterProduct.category",
          farmerName: "$farmer.name",
          totalQty: 1,
          totalRevenue: 1,
          orderCount: 1,
        },
      },
    ]);

    res.json(topProducts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ──────────────── All Users (for management) ────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ──────────────── Recent Activity ────────────────
exports.getRecentActivity = async (req, res) => {
  try {
    const recentOrders = await Order.find()
      .populate("customer", "name")
      .sort({ createdAt: -1 })
      .limit(15)
      .select("customer totalAmount status paymentMethod createdAt");

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name roles createdAt");

    const activity = [
      ...recentOrders.map((o) => ({
        type: "order",
        message: `${o.customer?.name || "Customer"} placed a ₹${o.totalAmount} order`,
        status: o.status,
        method: o.paymentMethod,
        time: o.createdAt,
      })),
      ...recentUsers.map((u) => ({
        type: "user",
        message: `${u.name} joined as ${u.roles[0]}`,
        time: u.createdAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 1️⃣ Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name email")
      .populate({
        path: "items.product",
        populate: {
          path: "masterProduct",
          model: "MasterProduct",
        },
      })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 2️⃣ Total sales
exports.getTotalSales = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $ne: "cancelled" },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.json({
      totalOrders: orders.length,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 3️⃣ Farmer-wise sales
exports.getFarmerSales = async (req, res) => {
  try {
    const orders = await Order.find({
      status: { $ne: "cancelled" },
    })
      .populate({
        path: "items.product",
        populate: {
          path: "farmer",
          model: "User",
          select: "name email",
        },
      });

    const farmerSales = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const farmerId = item.product.farmer._id.toString();

        if (!farmerSales[farmerId]) {
          farmerSales[farmerId] = {
            farmer: item.product.farmer.name,
            totalRevenue: 0,
            totalOrders: 0,
          };
        }

        farmerSales[farmerId].totalRevenue +=
          item.price * item.quantity;

        farmerSales[farmerId].totalOrders += 1;
      });
    });

    res.json(Object.values(farmerSales));
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// 4️⃣ Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const allowedStatuses = [
      "placed",
      "confirmed",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


exports.getAnalytics = async (req, res) => {
  try {

    // 1️⃣ Monthly Revenue
    const monthlyRevenue = await Order.aggregate([
  {
    $match: { status: { $ne: "cancelled" } },
  },
  {
    $group: {
      _id: { $month: "$createdAt" },
      revenue: { $sum: "$totalAmount" },
    },
  },
  { $sort: { "_id": 1 } },
]);


    const monthNames = [
      "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const formattedRevenue = monthlyRevenue.map(item => ({
      month: monthNames[item._id],
      revenue: item.revenue,
    }));

    // 2️⃣ Order Status Distribution
    const orderStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
    ]);

    const formattedStatus = orderStatus.map(item => ({
      name: item._id,
      value: item.value,
    }));

    res.json({
      monthlyRevenue: formattedRevenue,
      orderStatus: formattedStatus,
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

// 5️⃣ Mark order as delivered (Professional COD handling)
exports.markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        message: "Order already delivered",
      });
    }

    // ✅ Update order status
    order.status = "delivered";

    // ✅ If COD → mark payment as paid
    if (order.paymentMethod === "COD") {
      order.paymentStatus = "paid";
      order.paidAt = new Date();
    }

    await order.save();

    res.status(200).json({
      message: "Order marked as delivered successfully",
      order,
    });

  } catch (error) {
    console.error("Mark delivered error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};