const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  role: String, 
  id: String, 
  password: String,
  walletAddress: String, 
});

module.exports = mongoose.model("User", UserSchema);
