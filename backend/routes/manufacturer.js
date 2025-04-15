const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");
const Manufacturer = require("../models/manufacturer");

router.get("/profile", async (req, res) => {
    try {
        const { userID } = req.query;
        
        if (!userID) {
            return res.status(400).json({ message: "❌ User ID is required!" });
        }

        const manufacturer = await Manufacturer.findOne({ userID });

        if (!manufacturer) {
            return res.status(404).json({ message: "❌ Manufacturer not found!" });
        }

        res.json(manufacturer);
    } catch (err) {
        console.error("❌ Error fetching manufacturer:", err);
        res.status(500).json({ message: "❌ Server error", error: err.message });
    }
});
router.post("/add-medicine", async (req, res) => {
    try {
        const { 
            name, 
            manufacturer, 
            price, 
            stock, 
            expiryDate, 
            Is_discontinued = false, 
            type, 
            pack_size_label, 
            short_composition1 
        } = req.body;

      
        if (!name || !manufacturer || !price || !stock || !expiryDate || !type || !pack_size_label || !short_composition1) {
            return res.status(400).json({ message: "❌ All fields are required!" });
        }

        let medicine = await Medicine.findOne({ name, manufacturer });

        if (medicine) {
           
            medicine.stock += Number(stock);
            medicine.price = Number(price); 
            medicine.Is_discontinued = Is_discontinued;
        } else {
            const lastMedicine = await Medicine.findOne().sort({ id: -1 });
            const newId = lastMedicine ? lastMedicine.id + 1 : 1;

            medicine = new Medicine({
                id: newId,
                name,
                manufacturer,
                price: Number(price),
                stock: Number(stock),
                expiryDate,
                Is_discontinued,
                type,
                pack_size_label,
                short_composition1
            });
        }

        await medicine.save();
        res.status(201).json({ message: "✅ Medicine added/updated successfully!", medicine });
    } catch (err) {
        console.error("❌ Error adding medicine:", err);
        res.status(500).json({ message: "❌ Error adding medicine", error: err.message });
    }
});

router.get("/view-medicines", async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.json(medicines);
    } catch (err) {
        console.error("❌ Error fetching medicines:", err);
        res.status(500).json({ message: "❌ Error fetching medicines", error: err.message });
    }
});

router.get("/search-medicine", async (req, res) => {
  try {
      const { name } = req.query;
      
      if (!name) {
          return res.status(400).json({ message: "❌ Medicine name is required!" });
      }

      const medicines = await Medicine.find({ name: { $regex: name, $options: "i" } });

      if (medicines.length === 0) {
          return res.status(404).json({ message: "❌ No medicines found!" });
      }

      res.json(medicines);
  } catch (err) {
      console.error("❌ Error searching medicine:", err);
      res.status(500).json({ message: "❌ Server error", error: err.message });
  }
});

router.get("/medicine/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const medicine = await Medicine.findOne({ id: Number(id) });

        if (!medicine) {
            return res.status(404).json({ message: "❌ Medicine not found!" });
        }

        res.json(medicine);
    } catch (err) {
        console.error("❌ Error fetching medicine:", err);
        res.status(500).json({ message: "❌ Server error", error: err.message });
    }
});

router.delete("/delete-medicine/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const medicine = await Medicine.findOneAndDelete({ id: Number(id) });

        if (!medicine) {
            return res.status(404).json({ message: "❌ Medicine not found!" });
        }

        res.json({ message: "✅ Medicine deleted successfully!" });
    } catch (err) {
        console.error("❌ Error deleting medicine:", err);
        res.status(500).json({ message: "❌ Error deleting medicine", error: err.message });
    }
});

module.exports = router;
