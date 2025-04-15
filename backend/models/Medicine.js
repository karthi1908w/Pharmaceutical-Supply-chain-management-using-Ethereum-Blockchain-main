const mongoose = require("mongoose");

const MedicineSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  manufacturer: { type: String, required: true },
  price: { type: Number, required: true },  
  stock: { type: Number, required: true },
  Is_discontinued: { type: Boolean, default: false }, 
  type: { type: String, required: true },  
  pack_size_label: { type: String, required: true }, 
  short_composition1: { type: String, required: true },  
  expiryDate: { type: String, required: true },
});

module.exports = mongoose.model("Medicine", MedicineSchema);
