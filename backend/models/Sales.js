const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema({
  medicineName: { type: String, required: true }, 
  quantity: { type: Number, required: true },    
  date: { type: Date, default: Date.now },       
  orderId: { type: String },                    
});

module.exports = mongoose.model("Sales", SalesSchema);
