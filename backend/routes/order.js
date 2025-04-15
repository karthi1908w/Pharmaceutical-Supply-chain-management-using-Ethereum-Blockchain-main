const express = require("express");
const router = express.Router();
const Order = require("../models/order"); 
router.post("/save-order", async (req, res) => {
  try {
    const { customerDetails, cart, totalPrice, paymentStatus } = req.body;

    const newOrder = new Order({
      customerDetails,
      cart,
      totalPrice,
      paymentStatus,
      orderDate: new Date(),
    });

    await newOrder.save();
    res.status(201).json({ message: "Order saved successfully" });
  } catch (error) {
    console.error("Error saving order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;