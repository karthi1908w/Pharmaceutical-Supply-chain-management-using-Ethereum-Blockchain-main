const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const Distributor = require("../models/distributor");

router.get("/profile", async (req, res) => {
  try {
    const { userID } = req.query;
    if (!userID) return res.status(400).json({ error: "User ID is required" });

    const distributor = await Distributor.findOne({ userID });

    if (!distributor) return res.status(404).json({ error: "Distributor not found" });

    res.json(distributor);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

router.get("/view-medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching medicines!", error: err.message });
  }
});

module.exports = router;