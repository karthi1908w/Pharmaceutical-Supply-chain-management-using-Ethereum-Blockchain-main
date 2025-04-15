const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine"); 

router.post("/restock", async (req, res) => {
    const { medicineId, quantity } = req.body;

    try {
        const medicine = await Medicine.findById(medicineId);
        if (!medicine) return res.status(404).json({ message: "Medicine not found" });

        medicine.quantity += quantity; 
        await medicine.save();

        res.status(200).json({ message: "Stock updated successfully", medicine });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;