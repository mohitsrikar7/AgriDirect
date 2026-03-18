const mongoose = require("mongoose");
const Product = require("./models/Product");
const Order = require("./models/Order");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

async function test() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const product = await Product.findOne({ isActive: true });
    if (!product) return process.exit(0);

    console.log("Found product._id:", product._id);

    try {
        const orderItems = [{
            product: product._id,
            quantity: 1,
            price: product.pricePerKg
        }];
        console.log("orderItems payload:", JSON.stringify(orderItems));

        const order = await Order.create({
            customer: new mongoose.Types.ObjectId(),
            items: orderItems,
            totalAmount: product.pricePerKg || 100,
            status: "placed",
            paymentMethod: "COD"
        });
        console.log("Order created successfully:", order._id);
    } catch (error) {
        console.error("Order error name:", error.name);
        console.error("Order error message:", error.message);
        if (error.errors) {
            for (let key in error.errors) {
                console.log("ValidationError details:", key, error.errors[key].message);
            }
        }
    }

    process.exit(0);
}

test();
