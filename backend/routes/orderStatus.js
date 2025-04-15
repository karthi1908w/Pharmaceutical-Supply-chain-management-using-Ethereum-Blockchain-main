const express = require("express");
const router = express.Router();
const OrderModel = require("../models/order");
const mongoose = require("mongoose");

router.get("/:id", async (req, res) => {
  const orderId = req.params.id;

  console.log("Fetching order status for ID:", orderId); 

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    console.error("Invalid order ID format:", orderId);
    return res.status(400).json({ message: "Invalid order ID format" });
  }

  try {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      console.error("Order not found for ID:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("Order found:", order);
    res.json({ status: order.status });
  } catch (error) {
    console.error("Error fetching order status:", error);
    res.status(500).json({ message: "Error fetching order status", error });
  }
});

module.exports = router;