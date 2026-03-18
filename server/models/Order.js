const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: Number,
        price: Number,
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["placed", "confirmed", "delivered", "cancelled"],
      default: "placed",
    },

// ✅ PAYMENT FIELDS
paymentMethod: {
  type: String,
  enum: ["COD", "UPI", "NET_BANKING", "CARD"],
  default: "COD",
},

paymentStatus: {
  type: String,
  enum: ["pending", "paid", "failed", "refunded"],
  default: "pending",
},

transactionId: {
  type: String,
},

paidAt: {
  type: Date,
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
