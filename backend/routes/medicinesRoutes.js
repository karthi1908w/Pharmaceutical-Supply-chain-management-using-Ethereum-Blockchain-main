const express = require("express");
const router = express.Router();
const Order = require("../models/Orders");


router.post("/save-cart", async (req, res) => {
  try {
    const { cart, account } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty!" });
    }

    let totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = new Order({
      account,
      items: cart,
      totalAmount,
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved successfully!" });

  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


router.get("/get-orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


router.get("/get-orders/:account", async (req, res) => {
  try {
    const { account } = req.params;
    const orders = await Order.find({ account });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
