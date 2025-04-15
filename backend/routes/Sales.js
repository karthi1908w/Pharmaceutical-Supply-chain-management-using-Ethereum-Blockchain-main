const express = require("express");
const router = express.Router();
const Sales = require("../models/sales"); 


router.post("/api/sales", async (req, res) => {
  try {
    const { medicineName, quantity, date } = req.body;

   
    if (!medicineName || !quantity) {
      return res.status(400).json({ error: "Medicine name and quantity are required" });
    }

    
    const newSale = new Sales({
      medicineName,
      quantity,
      date: date || new Date(), 
    });

    await newSale.save();

    res.status(201).json(newSale);
  } catch (error) {
    console.error("Error saving sales data:", error);
    res.status(500).json({ error: "Error saving sales data" });
  }
});

module.exports = router;
