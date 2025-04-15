const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    city: String,
    state: String,
    pincode: String,
  },
  orderDetails: [
    {
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: Number,
  status: { type: String, default: "Pending" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);