require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const customerRoutes = require("./routes/customer");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const orderRoutes = require("./routes/order");
const OrderModel = require("./models/order"); 
const Invoice = require("./models/invoice"); 
 const serverless = require("serverless-http");
const CustomerModel = require("../backend/models/customer");

const OrderUpdate = require('./models/OrderUpdate'); 
const server = http.createServer(app); 
const io = new Server(server, {
  cors: { origin: "*" }, 
});
const MONGO_URI = "mongodb+srv://madhaneshwaranmadhan:1234@cluster0.hg8ai.mongodb.net/";
app.use(express.json());
app.use(cors({
  origin: "", // ✅ frontend domain
  credentials: true
}));

app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);



mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));






const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  walletAddress: { type: String, unique: true, sparse: true },
  userID: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  profilePic: String,
});

const User = mongoose.model("User", UserSchema);


const MedicineSchema = new mongoose.Schema({
  id: {type: Number, required: true},
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

const Medicine = mongoose.model("Medicine", MedicineSchema);

const OrderSchema = new mongoose.Schema({
  distributorID: { type: String, required: true }, 
  medicines: [
    {
      medicineID: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
      name: String,
      quantity: Number,
    },
  ],
  status: { type: String, default: "Pending" }, 
});

const authenticateAdmin = (req, res, next) => {
  const { name, userID, password } = req.headers;

  if (name === ADMIN_CREDENTIALS.name && userID === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
    req.admin = { name: ADMIN_CREDENTIALS.name, userID: ADMIN_CREDENTIALS.id };
    return next();
  }
  return res.status(403).json({ message: "❌ Unauthorized Access!" });
};

app.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, password, role } = req.body;

    if (!name || !password || !role) {
      return res.status(400).json({ message: "❌ Missing required fields!" });
    }

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: "❌ User already exists!" });
    }

    const userID = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePicPath = req.file ? `/uploads/${req.file.filename}` : "";

    const newUser = new User({
      name,
      userID,
      password: hashedPassword,
      role,
      profilePic: profilePicPath,
    });
    await newUser.save();

    console.log("📢 New User Registered:", { name, userID, role });

    res.json({ message: "✅ Registered Successfully!", name, userID });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "❌ Error registering user", error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { name, password, userID } = req.body;
    if (!name || !password || !userID) return res.status(400).json({ message: "❌ Missing login credentials!" });

  
    const user = await User.findOne({ name, userID });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "❌ Invalid credentials!" });
    }

    res.json({ role: user.role, message: "✅ Login Successful" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error logging in", error: err.message });
  }
});

app.get("/manufacturer/profile", async (req, res) => {
  try {
    const { userID } = req.query;
    if (!userID) return res.status(400).json({ error: "User ID is required" });

    const manufacturer = await User.findOne({ userID, role: "Manufacturer" });

    if (!manufacturer) return res.status(404).json({ error: "Manufacturer not found" });

    res.json(manufacturer);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.post("/manufacturer/add-medicine", async (req, res) => {
  try {
    let { 
      userID, 
      id,
      name, 
      price, 
      stock, 
      expiryDate, 
      Is_discontinued, 
      type, 
      pack_size_label, 
      short_composition1 
    } = req.body;

    console.log("📥 Received Medicine Data:", req.body);  
    if (!userID) {
      console.log("❌ Missing User ID");
      return res.status(400).json({ message: "❌ User ID is required!" });
    }

    
    const user = await User.findOne({ userID, role: "Manufacturer" });
    if (!user) {
      console.log("❌ Unauthorized Access Attempt by User ID:", userID);
      return res.status(403).json({ message: "❌ Unauthorized access!" });
    }

    const manufacturer = user.name; 

  
    if (!name || !price || !stock || !expiryDate || !type || !pack_size_label || !short_composition1) {
      console.log("❌ Missing Required Fields:", { name, price, stock, expiryDate, type, pack_size_label, short_composition1 });
      return res.status(400).json({ message: "❌ All fields are required!" });
    }
    
    price = parseFloat(price);
    stock = parseInt(stock);
  
    if (isNaN(price) || isNaN(stock)) {
      console.log("❌ Invalid Price or Stock:", { price, stock });
      return res.status(400).json({ message: "❌ Invalid price or stock value!" });
    }
  
    let existingMedicine = await Medicine.findOne({ name, manufacturer });
    
    if (existingMedicine) {
    
      existingMedicine.stock += stock;
      existingMedicine.Is_discontinued = Is_discontinued || existingMedicine.Is_discontinued; 
      existingMedicine.type = type || existingMedicine.type; 
      existingMedicine.pack_size_label = pack_size_label || existingMedicine.pack_size_label;
      existingMedicine.short_composition1 = short_composition1 || existingMedicine.short_composition1; 
    
      await existingMedicine.save();
      console.log("✅ Stock updated successfully:", existingMedicine);
      return res.status(200).json({ message: "✅ Stock updated successfully!", medicine: existingMedicine });
    } else {
     
      const newMedicine = new Medicine({
        id,
        name,
        manufacturer,
        price,
        stock,
        expiryDate,
        Is_discontinued: Is_discontinued || false, 
        type,
        pack_size_label,
        short_composition1
      });
    
      await newMedicine.save();
      console.log("✅ New medicine added successfully:", newMedicine);
      return res.status(201).json({ message: "✅ New medicine added successfully!", medicine: newMedicine });
    }

  } catch (err) {
    console.error("❌ Error in Adding Medicine:", err);
    res.status(500).json({ message: "❌ Error adding medicine", error: err.message });
  }
});


app.get("/manufacturer/view-medicines", async (req, res) => {
  console.log("📥 API Request Received: /view-medicines");

  try {
    const medicines = await Medicine.find(); 
    console.log("📦 Medicines Found:", medicines); 
    
    if (!medicines || medicines.length === 0) {
      console.log("⚠️ No medicines found in the database.");
    }
    
    res.json(medicines);
  } catch (err) {
    console.error("❌ Error fetching medicines:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/distributor/profile", async (req, res) => {
  try {
    const { userID } = req.query;
    if (!userID) return res.status(400).json({ error: "User ID is required" });

    const distributor = await User.findOne({ userID, role: "Distributor" });

    if (!distributor) return res.status(404).json({ error: "Distributor not found" });

    res.json(distributor);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.get("/admin/users", async (req, res) => {
  try {
    const users = await User.find({}, "userID name role profilePic"); 
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "❌ Internal Server Error" });
  }
});

app.delete("/admin/users/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    
    const deletedUser = await User.findOneAndDelete({ userID });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

app.get("/distributor/view-medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    console.error("❌ Error fetching medicines:", err);
    res.status(500).json({ message: "❌ Error fetching medicines!", error: err.message });
  }
});
app.get("/get-customer", async (req, res) => {
  const { name, password, userId } = req.query; 

  try {
    const user = await UserModel.findOne({ name, password, userId });

    if (!user) {
      return res.status(404).json({ error: "Customer not found!" });
    }

    res.json({ customerId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/distributor/make-payment", async (req, res) => {
  try {
    const { distributorID, amount } = req.body;

    if (!distributorID || !amount) {
      return res.status(400).json({ message: "❌ Distributor ID and amount are required!" });
    }

    const distributor = await User.findOne({ userID: distributorID, role: "Distributor" });
    if (!distributor) {
      return res.status(403).json({ message: "❌ Unauthorized distributor!" });
    }

    const weiAmount = web3.utils.toWei(amount.toString(), "ether");

    const tx = {
      from: process.env.PRIVATE_KEY,
      to: process.env.CONTRACT_ADDRESS,
      value: weiAmount,
      gas: 2000000,
    };

    const signedTx = await web3.eth.accounts.signTransaction(tx, process.env.PRIVATE_KEY);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    console.log("✅ Payment Successful:", receipt);

    res.status(200).json({ message: "✅ Payment Successful!", transactionHash: receipt.transactionHash });
  } catch (err) {
    console.error("❌ Payment Error:", err);
    res.status(500).json({ message: "❌ Payment failed!", error: err.message });
  }
});

app.post("/distributor/order-medicine", async (req, res) => {
  try {
    const { distributorID, medicines, transactionHash } = req.body;

    if (!distributorID || !medicines || !Array.isArray(medicines)) {
      return res.status(400).json({ message: "❌ Invalid request data!" });
    }

    const distributor = await User.findOne({ userID: distributorID, role: "Distributor" });
    if (!distributor) {
      return res.status(403).json({ message: "❌ Unauthorized distributor!" });
    }

  
    const newOrder = new OrderModel({
      cart,
      walletId,
      address,
      totalAmount,
      paymentStatus,
    });
    

    await newOrder.save();

    console.log("✅ Order Placed:", newOrder);
    res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });
  } catch (err) {
    console.error("❌ Error placing order:", err);
    res.status(500).json({ message: "❌ Error placing order", error: err.message });
  }
});
app.post("/pay", async (req, res) => {
  try {
      const { amount, sender } = req.body;
      const receipt = await contract.methods.makePayment().send({
          from: sender,
          value: web3.utils.toWei(amount, "ether"),
          gas: 300000
      });
      res.json({ success: true, receipt });
  } catch (error) {
      res.status(500).json({ success: false, error: error.message });
  }
});


app.post("/manufacturer/add-medicine", async (req, res) => {
  try {
    let { userID, name, price, stock, expiryDate } = req.body;

    if (!userID) return res.status(400).json({ message: "❌ User ID is required!" });

    const user = await User.findOne({ userID, role: "Manufacturer" });
    if (!user) return res.status(403).json({ message: "❌ Unauthorized access!" });

    const manufacturer = user.name;
    if (!name || !price || !stock || !expiryDate) {
      return res.status(400).json({ message: "❌ All fields are required!" });
    }

    price = parseFloat(price);
    stock = parseInt(stock);

    let existingMedicine = await Medicine.findOne({ name, manufacturer });
    if (existingMedicine) {
      existingMedicine.stock += stock;
      await existingMedicine.save();
      io.emit("medicineUpdated", existingMedicine);
      return res.status(200).json({ message: "✅ Stock updated!", medicine: existingMedicine });
    }

    const newMedicine = new Medicine({ name, manufacturer, price, stock, expiryDate });
    await newMedicine.save();

    io.emit("medicineUpdated", newMedicine); 
    res.status(201).json({ message: "✅ Medicine added!", medicine: newMedicine });
  } catch (err) {
    res.status(500).json({ message: "❌ Error adding medicine", error: err.message });
  }
});


app.get("/customer/view-medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find(); 
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: "Error fetching medicines" });
  }
});


app.post('/customer/order-medicines', async (req, res) => {
  try {
      console.log("➡️ Received order request:", req.body); 

      const { customerId, medicines } = req.body;
      
      if (!customerId || !medicines || !Array.isArray(medicines) || medicines.length === 0) {
          console.log("❌ Invalid order data received");
          return res.status(400).json({ error: "Invalid order details" });
      }

      console.log("✅ Order data validated successfully");

      const newOrder = new OrderModel({
          customerId,
          medicines,
          status: "Pending",
          orderDate: new Date()
      });

      console.log("🔄 Saving order to database...");
      await newOrder.save();
      console.log("✅ Order saved successfully:", newOrder);

      res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
      console.error("❌ Error placing order:", error);
      res.status(500).json({ error: "Server error" });
  }
});
app.post("/customer/place-order", async (req, res) => {
  try {
    const { customerName, medicines, address, walletId, totalAmount, paymentStatus } = req.body;

    if (!customerName || !medicines || !address || !walletId || !totalAmount || !paymentStatus) {
      return res.status(400).json({ error: "❌ Missing required fields." });
    }

    for (const item of medicines) {
      const medicine = await Medicine.findById(item.medicineID);
      if (!medicine || medicine.stock < item.quantity) {
        return res.status(400).json({ error: `❌ Insufficient stock for ${item.name}` });
      }
    }

    for (const item of medicines) {
      await Medicine.findByIdAndUpdate(item.medicineID, { $inc: { stock: -item.quantity } });
    }
r
    const newOrder = new OrderModel({
      customerName,
      medicines,
      address,
      walletId,
      totalAmount,
      paymentStatus,
      status: "Pending", 
      orderDate: new Date(),
    });

    await newOrder.save();

    return res.status(201).json({ message: "✅ Order placed successfully!", order: newOrder });

  } catch (error) {
    console.error("❌ Error placing order:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});


app.post("/orders", async (req, res) => {
  console.log("📥 Received order data:", req.body); 
  try {
    if (!req.body) {
      console.error("❌ Error: Request body is empty");
      return res.status(400).json({ error: "Request body cannot be empty" });
    }
    const { customerName, cart, walletId, address, totalAmount, paymentStatus } = req.body;
    if (!customerName) {
      return res.status(400).json({ error: "Customer name is required" });
    }
   
    console.log("🔍 Extracted values:", { cart, walletId, address, totalAmount, paymentStatus });

  
    if (!cart || cart.length === 0) {
      console.error("❌ Error: Cart is empty");
      return res.status(400).json({ error: "Cart cannot be empty" });
    }

    if (!walletId || walletId.trim() === "") {
      console.error("❌ Error: Wallet ID is missing");
      return res.status(400).json({ error: "Wallet ID is required" });
    }

    if (!address || address.trim() === "") {
      console.error("❌ Error: Address is missing");
      return res.status(400).json({ error: "Address is required" });
    }

    if (!totalAmount || isNaN(totalAmount) || totalAmount <= 0) {
      console.error("❌ Error: Invalid Total Amount");
      return res.status(400).json({ error: "Total amount must be a positive number" });
    }

    const validPaymentStatuses = ["pending", "completed", "failed"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      console.error("❌ Error: Invalid Payment Status");
      return res.status(400).json({ error: `Invalid payment status. Allowed values: ${validPaymentStatuses.join(", ")}` });
    }

    console.log("✅ All fields are valid. Saving order to database...");

    const newOrder = new OrderModel({
      customerName,
      cart,
      walletId: walletId.trim(), 
      address: address.trim(),
      totalAmount,
      paymentStatus,
    });

    await newOrder.save();
    console.log("✅ Order successfully saved!");

    return res.status(201).json({ message: "Order placed successfully!" });

  } catch (error) {
    console.error("❌ Error processing order:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customerDetails, orderDetails, totalPrice, transactionHash, paymentStatus } = req.body;


  console.log("Received order data:", req.body);

  if (!Array.isArray(orderDetails.cart)) {
    return res.status(400).json({ message: "orderDetails.cart must be an array" });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newOrder = new OrderModel({
      customerDetails,
      orderDetails: orderDetails.cart.map(item => ({
        medicineID: item.medicineID,
        name: item.name,
        price: Number(item.price), 
        quantity: item.quantity,
      })),
      totalPrice,
      transactionHash,
      paymentStatus,
      date: new Date(),
    });

  
    console.log("Saving order to database:", newOrder);

    await newOrder.save({ session });

   
    await session.commitTransaction();
    session.endSession();

 
    console.log("Order saved successfully! Order ID:", newOrder._id);

    res.status(201).json({ message: "Order saved successfully", orderId: newOrder._id });
  } catch (error) {
 
    await session.abortTransaction();
    session.endSession();

    console.error("Error while saving order:", error);
    res.status(500).json({ message: "Error saving order", error });
  }
});

app.use("/uploads", express.static(uploadPath));
app.get('/api/orders', async (req, res) => {
  try {
   
    const orders = await OrderModel.find({ status: { $ne: "Shipped" } });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders", error });
  }
});

app.put('/api/orderupdates:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order by ID
    const orderupdates = await OrderUpdates.findById(orderId);
    if (!orderUpdates) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Shipped";
    await orderUpdate.save();

   
    const orderUpdate = new OrderUpdate({
      customerDetails: order.customerDetails,
      orderDetails: order.orderDetails,
      totalPrice: order.totalPrice,
      date: new Date(),
      status: "Shipped",
    });
    await orderUpdate.save();

    console.log("Order processed and shipped:", order);

    res.json(order); 
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Failed to update order status", error });
  }
});

app.get('/api/orderupdates', async (req, res) => {
  try {
    const orderUpdates = await OrderUpdate.find();
    res.status(200).json(orderUpdates);
  } catch (error) {
    console.error("Error fetching order updates:", error);
    res.status(500).json({ message: "Error fetching order updates", error });
  }
});
app.put('/api/orderupdates/ship/:id', async (req, res) => {
  const orderId = req.params.id;

  console.log("Shipping order with ID:", orderId); 

  try {

    const orderUpdate = await OrderUpdate.findById(orderId);
    if (!orderUpdate) {
      console.error("Order not found in OrderUpdate for ID:", orderId);
      return res.status(404).json({ message: "Order not found in OrderUpdate" });
    }

    orderUpdate.status = "Shipped";
    orderUpdate.date = new Date(); 
    await orderUpdate.save();

    console.log("Order updated successfully in OrderUpdate:", orderUpdate);

    res.json(orderUpdate); 
  } catch (error) {
    console.error("Error updating order in OrderUpdate:", error);
    res.status(500).json({ message: "Failed to update order in OrderUpdate", error: error.message });
  }
});

app.get('/api/orders/shipped', async (req, res) => {
  try {
   
    const shippedOrders = await OrderUpdate.find({ status: "Shipped" });
    res.status(200).json(shippedOrders);
  } catch (error) {
    console.error("Error fetching shipped orders:", error);
    res.status(500).json({ message: "Error fetching shipped orders", error });
  }
});

const orderStatusRoutes = require("./routes/orderStatus");
app.use("/api/order-status", orderStatusRoutes);


app.get("/api/orderupdates", async (req, res) => {
  try {
    const orders = await OrderUpdate.find({}, { 
      "customerDetails.name": 1, 
      "customerDetails.houseNo": 1, 
      "customerDetails.street": 1, 
      "customerDetails.locality": 1, 
      "customerDetails.city": 1, 
      "customerDetails.state": 1, 
      "customerDetails.pincode": 1, 
      "orderDetails.name": 1, 
      "orderDetails.price": 1, 
      "orderDetails.quantity": 1 
    }); 
    res.json(orders);
  } catch (error) {
    console.error("Error fetching order updates:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
app.put('/api/orders/set-delivery/:id', async (req, res) => {
  const orderId = req.params.id;
  const { expectedDelivery } = req.body;

  try {
    const order = await OrderUpdate.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.expectedDelivery = expectedDelivery;
    await order.save();

    res.status(200).json({ message: "Expected delivery date set successfully", order });
  } catch (error) {
    console.error("Error setting expected delivery date:", error);
    res.status(500).json({ message: "Failed to set expected delivery date", error: error.message });
  }
});

app.get('/api/orderupdates/latest', async (req, res) => {
  try {
    const latestOrderUpdate = await OrderUpdate.findOne().sort({ date: -1 }); 
    if (!latestOrderUpdate) {
      return res.status(404).json({ message: "Order update not found" });
    }
    res.status(200).json(latestOrderUpdate);
  } catch (error) {
    console.error("Error fetching latest order update:", error);
    res.status(500).json({ message: "Failed to fetch latest order update", error: error.message });
  }
});

app.get('/api/orderupdates/customer/:customerId', async (req, res) => {
  const customerId = req.params.customerId;

  try {
    const orders = await OrderUpdate.find({ 'customerDetails.customerId': customerId });
    if (!orders) {
      return res.status(404).json({ message: "No orders found for this customer" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ message: "Failed to fetch customer orders", error: error.message });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching ordered medicines:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


app.get("/low-stock", async (req, res) => {
  try {
    const lowStockMedicines = await Medicine.find({
      availableQuantity: { $lt: 200 },
    });

    res.json({ lowStockMedicines });
  } catch (error) {
    console.error("Error fetching low stock medicines:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
app.get("/distributor/view-medicines", async (req, res) => {
  console.log("📥 API Request Received: /view-medicines");

  try {
    const medicines = await Medicine.find(); 
    console.log("📦 Medicines Found:", medicines); 
    
    if (!medicines || medicines.length === 0) {
      console.log("⚠️ No medicines found in the database.");
    }
    
    res.json(medicines);
  } catch (err) {
    console.error("❌ Error fetching medicines:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get("/distributor/view-medicines", async (req, res) => {
  try {
    const medicines = await MedicineModel.find(); 
    res.json(medicines);
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    console.log("Fetching all orders from the database...");

    
    const orders = await OrderModel.find({}, {
     
      "orderDetails.name": 1,
     
      "orderDetails.quantity": 1,
      
    });

    console.log("Orders fetched successfully:", orders);
    res.status(200).json(orders); 
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
app.post('/api/sales', async (req, res) => {
  try {
      const { orderDetails } = req.body;

     
      if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
          return res.status(400).json({ error: 'Invalid order details' });
      }

     
      const newOrder = new Order({ orderDetails });
      const savedOrder = await newOrder.save();

      res.status(201).json({ message: 'Order saved successfully', order: savedOrder });
  } catch (error) {
      console.error('Error saving order:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

const Sales = mongoose.models.Sales || mongoose.model('Sales', new mongoose.Schema({
    orderDetails: [
        {
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    createdAt: { type: Date, default: Date.now },
}));


app.post('/api/sales', async (req, res) => {
  try {
      const { orderDetails } = req.body;

      
      if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
          return res.status(400).json({ error: 'Invalid order details' });
      }

     
      const newSale = new Sales({ orderDetails });
      const savedSale = await newSale.save();

      res.status(201).json({ message: 'Order saved successfully in sales', sale: savedSale });
  } catch (error) {
      console.error('Error saving order in sales:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sales', async (req, res) => {
  const { orderId } = req.body;

  try {

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }


    const newSale = new Sales({
      orderDetails: order.orderDetails,
      createdAt: new Date(),
    });
    await newSale.save();

   
    order.sent = true;
    await order.save();

    res.status(200).json({ message: "Order sent successfully", sale: newSale });
  } catch (error) {
    console.error("Error sending order:", error);
    res.status(500).json({ message: "Failed to send order", error: error.message });
  }
});
// Backend API example (Node.js/Express)
app.get('/api/orderupdates/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;
  try {
    const orders = await Order.find({ customerId }); // Fetch orders for the specific customer
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
// API to fetch user profile by userID
app.get('/api/profile', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token is required and must be in the format 'Bearer <token>'" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userID = decoded.userID;

    const user = await User.findOne({ userID });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

  
    res.status(200).json({ username: user.name, id: user.userID, role: user.role });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put('/api/orders/set-delivery/:id', async (req, res) => {
  const orderId = req.params.id;
  const { expectedDelivery } = req.body;

  try {
   
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: `Order not found for ID: ${orderId}` });
    }

    
    order.expectedDelivery = expectedDelivery;
    await order.save();

   
    const orderUpdate = await OrderUpdate.findOne({ _id: orderId });
    if (orderUpdate) {
      orderUpdate.expectedDelivery = expectedDelivery;
      await orderUpdate.save();
    }

    res.json({ message: "Delivery date updated successfully", order });
  } catch (error) {
    console.error("Error updating delivery date:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
});
app.get('/api/orderupdates/customer/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    const orders = await OrderUpdate.find({ "customerDetails.customerId": customerId });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this customer." });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ message: "Failed to fetch customer orders.", error });
  }
});
app.get("/customer/view-medicines", async (req, res) => {
  const { page = 1, limit = 8 } = req.query;

  try {
    const medicines = await Medicine.find()
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalMedicines = await Medicine.countDocuments();

    res.json({ medicines, totalMedicines });
  } catch (err) {
    console.error("Error fetching medicines:", err);
    res.status(500).json({ message: "Error fetching medicines" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    console.log("Fetching all orders from the database...");

  
    const orders = await OrderModel.find(); 
    console.log("Orders fetched successfully:", orders);

    res.status(200).json(orders); 
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token is required and must be in the format 'Bearer <token>'" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userID = decoded.userID;

   
    const user = await User.findOne({ userID }, "name userID role"); 
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/invoices", async (req, res) => {
  try {
    const { customerId, customerName, orderDetails, totalPrice, date } = req.body;

   
    if (!customerId || !customerName || !orderDetails || !totalPrice || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newInvoice = new Invoice({
      customerId,
      customerName,
      orderDetails,
      totalPrice,
      date,
    });

    
    await newInvoice.save();

    res.status(201).json({ message: "Invoice created successfully", invoice: newInvoice });
  } catch (error) {
    console.error("Error storing invoice:", error);
    res.status(500).json({ message: "Error storing invoice", error: error.message });
  }
});
app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find(); 
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Error fetching invoices", error: error.message });
  }
});
app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("customerDetails"); 
    res.status(200).json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ message: "Error fetching invoices", error: error.message });
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const customers = await User.find(
      { role: { $regex: /^customer$/i } },
      { _id: 1, name: 1, userID: 1 } 
    );
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Error fetching customers", error: error.message });
  }
});


const OrderUpdateModel = mongoose.models.OrderUpdate || mongoose.model("OrderUpdate", new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true },
  date: { type: Date, default: Date.now },
}));


app.post("/api/orderupdates", async (req, res) => {
  try {
    const { orderId, status, updatedAt } = req.body;

   
    if (!orderId || !status || !updatedAt) {
      return res.status(400).json({ message: "Missing required fields: orderId, status, or updatedAt" });
    }

    
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    
    const orderUpdate = new OrderUpdate({
      customerDetails: order.customerDetails, 
      orderDetails: order.orderDetails, 
      totalPrice: order.totalPrice, 
      date: updatedAt || new Date(), 
      status: status || "Shipped", 
    });

    await orderUpdate.save();

    res.status(201).json({ message: "Order update saved successfully", orderUpdate });
  } catch (error) {
    console.error("Error saving order update:", error);
    res.status(500).json({ message: "Failed to save order update", error });
  }
});
app.post('/api/orderupdates', async (req, res) => {
  try {
    const { orderId, status, updatedAt } = req.body;

   
    if (!orderId || !status || !updatedAt) {
      return res.status(400).json({ message: "Missing required fields: orderId, status, or updatedAt" });
    }

    
    const orderUpdate = await OrderUpdate.findOne({ orderId });
    if (!orderUpdate) {
      return res.status(404).json({ message: "Order update not found" });
    }

  
    orderUpdate.status = status || "Shipped"; 
    orderUpdate.date = updatedAt || new Date(); 
    await orderUpdate.save();

    res.status(201).json({ message: "Order update saved successfully", orderUpdate });
  } catch (error) {
    console.error("Error saving order update:", error);
    res.status(500).json({ message: "Failed to save order update", error });
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await OrderModel.find({}); 
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("distributor/medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find(); 
    res.status(200).json(medicines); 
  } catch (error) {
    console.error("Error fetching medicines:", error);
    res.status(500).json({ error: "Failed to fetch medicines" });
  }
});
app.get("/api/orders", async (req, res) => {
  try {
    const { username } = req.query; 

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    
    const orders = await OrderModel.find({ "customerDetails.name": username });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders); 
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});
app.get("/api/users", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization token is required and must be in the format 'Bearer <token>'" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const userID = decoded.userID;

    const user = await User.findOne({ userID }, "name userID role");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { name, password, userID } = req.body;

    const user = await User.findOne({ name, userID });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userID: user.userID }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ token, role: user.role, message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;
module.exports.handler = serverless(app);

