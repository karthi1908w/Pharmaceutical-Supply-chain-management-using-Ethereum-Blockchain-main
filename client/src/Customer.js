import React, { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import Lottie from "lottie-react"; 
import loadingAnimation from "./assets/animations/medload.json"; 
import medload from "./assets/animations/medload.json"; 
import jsPDF from "jspdf"; 
import html2canvas from "html2canvas"; 
import {
  AppBar, Toolbar, Typography, Box, TextField, Container, 
  Grid, Card, CardContent, Pagination, CircularProgress, IconButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  Menu, MenuItem, Badge, Avatar
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import MetaMaskOnboarding from "@metamask/onboarding";
import { 
  TableContainer, 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Paper 
} from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import { BrowserRouter as Router, Route, Switch, Link, useHistory } from 'react-router-dom'; 
import TrackOrder from './TrackOrder';
import { FaGoogle, FaTwitter, FaFacebook, FaPinterest } from "react-icons/fa";

const Customer = () => {
  const history = useHistory(); 

  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [isCartOpen, setCartOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    houseNo: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
  });
  const handleCustomerDetailsChange = (event) => {
    const { name, value } = event.target;
    setCustomerDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };
  
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isPaymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isOrderSummaryOpen, setOrderSummaryOpen] = useState(false);

  const [invoices, setInvoices] = useState([]); 
  const [isInvoiceDialogOpen, setInvoiceDialogOpen] = useState(false); 

  const [selectedInvoice, setSelectedInvoice] = useState(null); 
  const [isViewInvoiceDialogOpen, setViewInvoiceDialogOpen] = useState(false); 


  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({ username: "", id: "", role: "" });

  
  const [isOrdersDialogOpen, setOrdersDialogOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]); 

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      console.log("Retrieved Token:", token); 

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

  const fetchCustomerProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("Token not found. Please log in.");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 && response.data) {
        console.log("Customer Profile Data:", response.data);
        
        setProfileData(response.data);
      } else {
        console.error("Failed to fetch customer profile:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching customer profile:", error.response?.data || error.message);
    }
  };

  
  const fetchUserOrders = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders"); 
      if (response.status === 200) {
        const filteredOrders = response.data.filter(
          (order) => order.customerDetails?.name === profileData.username 
        );
        setUserOrders(filteredOrders); 
      } else {
        console.error("Failed to fetch orders:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  
  const handleOrdersOpen = async () => {
    await fetchUserOrders(); 
    setOrdersDialogOpen(true);
  };

  
  const handleOrdersClose = () => {
    setOrdersDialogOpen(false);
  };

  
  const handleProfileOpen = async () => {
    await fetchProfileData(); 
    setProfileDialogOpen(true);
  };

  
  const handleProfileClose = () => {
    setProfileDialogOpen(false);
  };

  useEffect(() => {
    fetchMedicines();
    connectWallet();
  }, []);

  useEffect(() => {
    if (paymentStatus) {
      setTimeout(() => setPaymentDialogOpen(false), 3000);
    }
  }, [paymentStatus]);

    
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:5000/customer/view-medicines");
        setMedicines(res.data);
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError("Failed to load medicines. Please try again.");
      }
      setLoading(false);
    };
  
    
    const connectWallet = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (err) {
          console.error("User rejected MetaMask connection.");
        }
      } else {
        alert("Please install MetaMask to make payments.");
      }
    };


  const addToCart = (medicine) => {
    const existingItem = cart.find(item => item.id === medicine.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
  };


  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  }
  const totalPrice = cart.reduce((total, item) => total + item["price(₹)"] * item.quantity, 0);

  
  const payWithMetaMask = async () => {
    if (!account) {
      alert("Please connect MetaMask first.");
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const amountInEther = (totalPrice / 80).toFixed(5); 

      const transaction = await web3.eth.sendTransaction({
        from: account,
        to: "0x5291CdDc877DE92b7048e4df7d176854ac8f1529", 
        value: web3.utils.toWei(amountInEther, "ether"),
      });

      console.log("Transaction Successful:", transaction);
    
      const orderDetails = {
        customer: customerDetails,
        cart: cart.map(({ id, name, quantity, ["price(₹)"]: price }) => ({ id, name, quantity, price })), // Ensure price is included
        totalPrice,
        transactionHash: transaction.transactionHash, 
        paymentStatus: "Success",
        date: new Date().toISOString(),
      };
      setOrderDetails(orderDetails); 
      setPaymentStatus("success");
      setPaymentDialogOpen(true);

      
      saveOrderToDB(orderDetails);

  
      setCart([]);

    } catch (error) {
      console.error("Payment Failed:", error);
      setPaymentStatus("failed");
      setPaymentDialogOpen(true);
    }
  };

  
  const saveOrderToDB = async (orderDetails) => {
    const orderData = { customerDetails, orderDetails, totalPrice };

    
    console.log("Attempting to save order:", orderData);

    try {
      const response = await fetch('http://localhost:5000/api/orders', {  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      
      console.log("Response received:", response);

      const result = await response.json();

      if (response.ok) {
  
        console.log("Order saved! Order ID:", result.orderId);
      } else {
        console.error("Error saving order:", result.message);
      }
    } catch (error) {
      console.error("Network error while saving order:", error);
    }
  };
  
  const handleClose = () => {
    setOrderSummaryOpen(false);
  };

  
  const updateCartQuantity = (id, quantity) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: quantity } : item));
  };

 
  const incrementQuantity = (id) => {
    setCart(cart.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  
  const decrementQuantity = (id) => {
    setCart(cart.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item));
  };

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/invoices"); 
      if (response.status === 200) {
        setInvoices(response.data); 
      } else {
        console.error("Failed to fetch invoices:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleViewInvoice = (invoice) => {
    console.log("Opening invoice dialog for:", invoice); 
    setSelectedInvoice(invoice); 
    setViewInvoiceDialogOpen(true); 
  };

  const downloadInvoiceAsPDF = () => {
    if (!selectedInvoice) {
      console.error("No invoice selected");
      return;
    }
  
    const doc = new jsPDF({ format: "a4" });
  
    
    doc.setFontSize(18);
    doc.text("INVOICE", 105, 20, { align: "center" });
  
    
    doc.setFontSize(12);
    doc.text(`Customer Name: ${selectedInvoice.customerName}`, 20, 40);
    doc.text(
      `Address: ${selectedInvoice.customerDetails?.houseNo}, ${selectedInvoice.customerDetails?.street}, ${selectedInvoice.customerDetails?.locality}, ${selectedInvoice.customerDetails?.city}, ${selectedInvoice.customerDetails?.state}, ${selectedInvoice.customerDetails?.pincode}`,
      20,
      50,
      { maxWidth: 170 }
    );
  
   
    doc.text("Order Details:", 20, 70);
    let yPosition = 80;
    doc.setFontSize(10);
    doc.text("Description", 20, yPosition);
    doc.text("Amount", 150, yPosition);
    yPosition += 10;
  
    selectedInvoice.orderDetails.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name}`, 20, yPosition);
      doc.text(`₹${item.price}`, 150, yPosition);
      yPosition += 10;
    });
  
    
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(`Total Amount: ₹${selectedInvoice.totalPrice}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Late Fees: ₹500`, 20, yPosition);
    yPosition += 10;
    doc.text(`Payable Amount: ₹${selectedInvoice.totalPrice + 500}`, 20, yPosition);
  
  
    yPosition += 20;
    doc.setFontSize(10);
    doc.text("Thanks for shopping!", 105, yPosition, { align: "center" });
  
    
    doc.save(`Invoice_${selectedInvoice.customerName}.pdf`);
  };

  const exportPDF = async () => {
    const invoiceElement = document.getElementById("invoice-section");
    const downloadButton = document.getElementById("download-button");
    if (!invoiceElement) {
      console.error("Invoice section not found!");
      return;
    }
  
    try {
      
      const images = invoiceElement.getElementsByTagName("img");
      for (let img of images) {
        if (!img.complete) await new Promise((resolve) => (img.onload = resolve));
      }
      if (downloadButton) {
        downloadButton.style.visibility = "hidden"; 
      }
      const canvas = await html2canvas(invoiceElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
  
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
      pdf.save("invoice.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      
      if (downloadButton) {
        downloadButton.style.visibility = "visible";
      }
    }
  };

  return (
    <Router>
      <Box sx={{ background: "#f0f2f5", minHeight: "100vh", paddingBottom: "30px" }}>
       
        <AppBar position="static" sx={{ background: "#1976d2" }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Pharmacy</Typography>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { setOrderSummaryOpen(true); handleMenuClose(); }}>Order Summary</MenuItem>
              <MenuItem onClick={() => { handleOrdersOpen(); handleMenuClose(); }}>Orders</MenuItem> {/* Renamed to Orders */}
              <MenuItem onClick={() => { handleProfileOpen(); handleMenuClose(); }}>Profile</MenuItem>
              <MenuItem
                onClick={() => {
                  fetchInvoices();
                  handleMenuClose();
                  history.push("/view-invoice");
                }}
              >
                Invoice
              </MenuItem>
              {account ? (
                <MenuItem onClick={handleMenuClose}>Wallet: {account}</MenuItem>
              ) : (
                <MenuItem onClick={() => { connectWallet(); handleMenuClose(); }}>Connect Wallet</MenuItem>
              )}
            </Menu>
            <IconButton color="inherit" onClick={() => setCartOpen(true)}>
              <Badge badgeContent={cart.length} color="secondary">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
         
          <Box sx={{
            display: "flex", 
            alignItems: "center", 
            borderRadius: "50px", 
            background: "linear-gradient(135deg, rgb(186, 26, 239) 0%, rgb(112, 17, 230) 100%)", 
            padding: "5px 15px", 
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)", 
            color: "#fff",
          }}>
            <TextField
              variant="standard"
              placeholder="Search medicine..."
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{ disableUnderline: true, sx: { fontSize: "16px", marginLeft: "10px" } }}
            />
            <IconButton sx={{ backgroundColor: "#1976d2", color: "white" }}>
              <SearchIcon />
            </IconButton>
          </Box>

         
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
              <Lottie animationData={medload} style={{ width: 100, height: 100 }} />
            </Box>
          ) : error ? (
            <Typography variant="h6" sx={{ mt: 3, textAlign: "center", color: "red" }}>{error}</Typography>
          ) : medicines.length > 0 ? (
            <>
              <Grid container spacing={3} sx={{ mt: 4 }}>
                {medicines
                  .filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .slice((page - 1) * itemsPerPage, page * itemsPerPage) 
                  .map(med => (
                    <Grid item xs={12} sm={6} md={4} key={med._id}>
  <div className="bg-[#FDFAF6] rounded-xl shadow-md p-6 text-center">
  <h2 className="text-lg font-bold text-[#D70654] mb-2">{med.name}</h2>
  <p className="text-base font-medium text-gray-700 mb-4">
    💰 Price: ₹{med["price(₹)"]}
  </p>
  <button
    onClick={() => addToCart(med)}
    className="bg-[#5CB338] text-white rounded-full px-6 py-2 transition-all duration-300 hover:bg-green-700"
  >
    Add to Cart
  </button>
</div>

                    </Grid>
                  ))}
              </Grid>

              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination count={Math.ceil(medicines.length / itemsPerPage)} page={page} onChange={(event, value) => setPage(value)} color="primary" />
              </Box>
            </>
          ) : (
            <Typography variant="h6" sx={{ mt: 3, textAlign: "center" }}>No medicines found.</Typography>
          )}
        </Container>


       
        <Dialog open={isCartOpen} onClose={() => setCartOpen(false)}>
          <DialogTitle>Your Cart</DialogTitle>
          <DialogContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>₹{item["price(₹)"]}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <TextField
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value))}
                            inputProps={{ min: 1 }}
                            sx={{ width: "100px", textAlign: "center" }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell><Button onClick={() => removeFromCart(item.id)}>Remove</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {Object.keys(customerDetails).map(field => (
              <TextField key={field} name={field} label={field.replace(/([A-Z])/g, ' $1')} fullWidth margin="normal" onChange={handleCustomerDetailsChange} />
            ))}

            <Button onClick={payWithMetaMask} color="primary">Proceed to Pay</Button>
           
            <Dialog open={isPaymentDialogOpen} onClose={() => setPaymentDialogOpen(false)}>
              <DialogTitle>
                {paymentStatus === "success" ? "Payment Successful" : "Payment Failed"}
              </DialogTitle>
              <DialogContent>
                <img
                  src={paymentStatus === "success" ? "/images/ps.gif" : "/images/pf.gif"}
                  alt={paymentStatus === "success" ? "Success" : "Failure"}
                  style={{ width: "100%", maxWidth: "300px", display: "block", margin: "auto" }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setPaymentDialogOpen(false)} color="primary">Close</Button>
              </DialogActions>
            </Dialog>
          </DialogContent>
        </Dialog>

       

        
<Dialog open={isProfileDialogOpen} onClose={handleProfileClose} maxWidth="xs" fullWidth>
  <DialogTitle align="center">👤 Profile</DialogTitle>
  <DialogContent>
    <Box display="flex" flexDirection="column" alignItems="center">
      <Avatar 
        src={profileData.image || "https://via.placeholder.com/100"} 
        sx={{ width: 100, height: 100, bgcolor: "purple", mb: 2 }} 
      />
      <Typography variant="h6" mt={1}>{profileData.username || "Guest User"}</Typography>
      <Box mt={2} textAlign="center">
        <Typography variant="body1"><strong>User ID:</strong> {profileData.id || "N/A"}</Typography>
        <Typography variant="body1"><strong>Role:</strong> {profileData.role || "N/A"}</Typography>
      </Box>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleProfileClose} color="primary" fullWidth>Close</Button>
  </DialogActions>
</Dialog>

        
        <Dialog open={isOrdersDialogOpen} onClose={handleOrdersClose} maxWidth="md" fullWidth>
          <DialogTitle align="center">🛒 Your Orders</DialogTitle>
          <DialogContent>
            {userOrders.length > 0 ? (
              userOrders.map((order) => (
                <Box key={order._id} sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: "8px" }}>
                  <Typography variant="h6">Order ID: {order._id}</Typography>
                  <Typography variant="body1"><strong>Date:</strong> {new Date(order.date).toLocaleString()}</Typography>
                  <Typography variant="body1"><strong>Total Price:</strong> ₹{order.totalPrice}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}><strong>Items:</strong></Typography>
                  <ul>
                    {order.orderDetails.map((item, index) => (
                      <li key={index}>
                        {item.name} - ₹{item.price} x {item.quantity}
                      </li>
                    ))}
                  </ul>
                </Box>
              ))
            ) : (
              <Typography variant="body1" align="center" color="textSecondary">
                No orders found.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleOrdersClose} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        

        <Switch>
          <Route path="/track-order" component={TrackOrder} />
        </Switch>
      </Box>
    </Router>
  );
};

export default Customer;