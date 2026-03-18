const Order = require("../models/Order");
const Product = require("../models/Product");
const crypto = require("crypto");
const razorpay = require("../config/razorpayInstance");

exports.placeOrder = async (req, res) => {
  try {
    const { items, paymentMethod } = req.body;

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {

      const product = await Product.findOne({
        _id: item.product,
        quantity: { $gte: item.quantity },
        isActive: true,
      });

      if (!product) {
        return res.status(400).json({
          message: "Insufficient stock",
        });
      }

      // 🔥 Use FIXED pricePerKg
      const pricePerUnit = product.pricePerKg;

      // 🔥 Reduce quantity only
      product.quantity -= item.quantity;
      // 🔥 Prevent negative stock and auto deactivate
      if (product.quantity <= 0) {
        product.quantity = 0;
        product.isActive = false;
      }
      await product.save({ validateBeforeSave: false });

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: pricePerUnit,
      });

      totalAmount += pricePerUnit * item.quantity;
    }


    const allowedMethods = ["COD", "UPI", "NET_BANKING", "CARD"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    let paymentStatus = "pending";
    let transactionId = null;
    let paidAt = null;

    if (paymentMethod !== "COD") {
      paymentStatus = "paid";
      transactionId = "TXN" + Date.now();
      paidAt = new Date();
    }

    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      totalAmount: Number(totalAmount.toFixed(2)),

      status: "placed", // ✅ explicitly set

      paymentMethod,
      paymentStatus,
      transactionId,
      paidAt,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    console.error("Order error:", error);
    res.status(500).json({
      message: "Server error while placing order",
      error: error.message,
    });
  }
};




// ✅ GET LOGGED-IN CUSTOMER ORDERS
exports.getMyOrders = async (req, res) => {
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

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.customer) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const allowedMethods = ["COD", "UPI", "NET_BANKING", "CARD"];

    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    order.paymentMethod = paymentMethod;

    if (paymentMethod !== "COD") {
      order.paymentStatus = "paid";
      order.transactionId = "TXN" + Date.now();
      order.paidAt = new Date();
    } else {
      order.paymentStatus = "pending";
    }

    await order.save();

    // Populate items for frontend display
    await order.populate({
      path: "items.product",
      populate: {
        path: "masterProduct",
        model: "MasterProduct",
      },
    });

    res.json({ message: "Payment updated successfully", order });

  } catch (error) {
    res.status(500).json({
      message: "Payment update failed",
      error: error.message,
    });
  }
};

// 💳 INITIALIZE RAZORPAY ORDER
exports.createRazorpayOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (String(order.customer) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Convert amount to paise (multiply by 100)
    const options = {
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: `receipt_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      message: "Razorpay order created",
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order: order
    });
  } catch (error) {
    console.error("Razorpay order creation failed", error);
    res.status(500).json({
      message: "Razorpay order creation failed",
      error: error.message,
    });
  }
};

// 💳 VERIFY RAZORPAY PAYMENT
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod } = req.body;
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Payment is valid, update order status
    const allowedOnlineMethods = ["UPI", "NET_BANKING", "CARD"];
    order.paymentStatus = "paid";
    order.paymentMethod = allowedOnlineMethods.includes(paymentMethod) ? paymentMethod : "ONLINE";
    order.transactionId = razorpay_payment_id;
    order.paidAt = new Date();

    await order.save();

    await order.populate({
      path: "items.product",
      populate: { path: "masterProduct", model: "MasterProduct" },
    });

    res.json({ message: "Payment verified successfully", order });
  } catch (error) {
    console.error("Payment verification failed", error);
    res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

