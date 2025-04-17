import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { 
  Menu, MenuItem, AppBar, Toolbar, IconButton, Typography, 
  Box, List, ListItem, ListItemText, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button, Avatar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { FaGoogle, FaTwitter, FaFacebook, FaPinterest } from "react-icons/fa";

const Distributor = () => {
  const [distributor, setDistributor] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", id: "", role: "" });
  const history = useHistory();

  const userID = localStorage.getItem("userID");

  useEffect(() => {
    if (!userID) {
      alert("Unauthorized Access!");
      window.location.href = "/login";
      return;
    }
    fetchDistributor();
    fetchMedicines();
  }, []);

  const fetchDistributor = async () => {
    try {
      const res = await axios.get(`https://pharma-backend-z97z.onrender.com/distributor/profile?userID=${userID}`);
      setDistributor(res.data);
    } catch (err) {
      console.error("Error fetching distributor details:", err);
      setError("Error fetching distributor details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("https://pharma-backend-z97z.onrender.com/medicines"); 
      console.log("Fetched Medicines:", res.data); 
      if (Array.isArray(res.data)) {
        setMedicines(res.data);
      } else {
        setError("Invalid data format from API.");
        console.error("Invalid data format:", res.data);
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
      setError("Failed to fetch medicines.");
    }
  };

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("Token not found. Please log in.");
        return;
      }

     
      const response = await axios.get("https://pharma-backend-z97z.onrender.com/api/profile", {
        headers: { Authorization: `Bearer ${token}` }, 
      });

      if (response.status === 200 && response.data) {
        const { username, id, role } = response.data; 
        console.log("Profile Data:", response.data);

        setProfileData({ name: username, id, role });
      } else {
        console.error("Failed to fetch profile data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const handleProfileOpen = async () => {
    await fetchProfileData(); 
    setProfileDialogOpen(true);
  };

  const handleProfileClose = () => {
    setProfileDialogOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("userID");
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  const handleInvoiceOpen = () => {
    history.push("/invoice-generator");
  };

  return (
    <Box sx={{ background: "linear-gradient(to right, #6a11cb, #2575fc)", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ background: "rgba(0, 0, 0, 0.8)" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {loading ? "Loading..." : distributor ? `Welcome Back, ${distributor.name}!👋` : "Error loading distributor"}
          </Typography>
          <IconButton color="inherit" onClick={(e) => setMenuOpen(e.currentTarget)}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={menuOpen} open={Boolean(menuOpen)} onClose={() => setMenuOpen(null)}>
            <MenuItem onClick={() => { history.push("/vieworder"); setMenuOpen(null); }}>📦 View Orders</MenuItem>
            <MenuItem onClick={() => { history.push("/warehouse"); setMenuOpen(null); }}>🏢 Warehouse</MenuItem>
            <MenuItem onClick={() => { history.push("/order-updates"); setMenuOpen(null); }}>🔄 Order Update</MenuItem>
            <MenuItem onClick={handleProfileOpen}>👤 Profile</MenuItem>
            <MenuItem onClick={handleInvoiceOpen}>🧾 Invoice Generator</MenuItem> 
            <MenuItem onClick={handleLogout}><LogoutIcon sx={{ marginRight: 1 }} /> Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom>Medicines</Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {medicines.map((medicine) => (
              <ListItem key={medicine._id}>
                <ListItemText 
                  primary={medicine.name} 
                  secondary={`Price: $${medicine.price} | Stock: ${medicine.stock}`} 
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      
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
    </Box>
  );
};

export default Distributor;
