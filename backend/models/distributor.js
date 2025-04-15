const mongoose = require("mongoose");

const distributorSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
});

module.exports = mongoose.model("Distributor", distributorSchema);