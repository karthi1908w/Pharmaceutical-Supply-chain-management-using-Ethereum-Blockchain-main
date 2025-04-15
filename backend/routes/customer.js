const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");
const Order = require("../models/order");

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, address, walletAddress } = req.body;

        const existingCustomer = await Customer.findOne({ email });
        if (existingCustomer) return res.status(400).json({ message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer = new Customer({ name, email, password: hashedPassword, address, walletAddress });

        await newCustomer.save();
        res.status(201).json({ message: "Customer registered successfully" });

    } catch (error) {
        console.error("❌ Error registering customer:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find();
        res.json(customers);
    } catch (error) {
        console.error("❌ Error fetching customers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/place-order", async (req, res) => {
    try {
        const { customerName, address, walletId, orders, total } = req.body;

        
        if (!customerName || !address || !walletId || !orders || orders.length === 0) {
            return res.status(400).json({ error: "Customer name, address, wallet ID, and at least one order item are required!" });
        }

        const newOrder = new Order({
            customerName,
            address,
            walletId,
            orders,
            total,
            paymentStatus: "Paid",
            date: new Date(),
        });

        await newOrder.save();
        res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });

    } catch (error) {
        console.error("❌ Error placing order:", error.message, error.stack);
        res.status(500).json({ error: `❌ Internal Server Error: ${error.message}` });
    }
});
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find().populate("orders.medicineId"); 
        res.json(orders);
    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const fetchProfileData = async () => {
    try {
        const token = localStorage.getItem("authToken");

        if (!token) {
            console.error("Token not found. Please log in.");
            return;
        }

        const response = await axios.get("http://localhost:5000/api/users", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && response.data) {
            console.log("Profile Data:", response.data);
            setProfileData(response.data);
        } else {
            console.error("Failed to fetch profile data:", response.statusText);
        }
    } catch (error) {
        console.error("Error fetching profile data:", error.response?.data || error.message);
    }
};

module.exports = router;
