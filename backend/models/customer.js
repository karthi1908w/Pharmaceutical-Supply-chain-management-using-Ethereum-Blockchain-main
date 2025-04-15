const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    walletAddress: { type: String, required: true, unique: true },
}, { timestamps: true });

module.exports = mongoose.model("Customer", CustomerSchema);
