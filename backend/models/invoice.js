const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  orderDetails: { type: Array, required: true }, 
  totalPrice: { type: Number, required: true },
  date: { type: String, required: true },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);