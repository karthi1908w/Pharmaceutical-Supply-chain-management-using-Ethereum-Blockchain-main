const mongoose = require("mongoose");

const orderUpdateSchema = new mongoose.Schema({
  customerDetails: {
    name: String,
    houseNo: String,
    street: String,
    locality: String,
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
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["Pending", "Processed", "Shipped", "Delivered"],
    default: "Pending", 
  },
  expectedDelivery: Date, 

});

const OrderUpdate = mongoose.model("OrderUpdate", orderUpdateSchema);
module.exports = OrderUpdate;

