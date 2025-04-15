import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Menu, MenuItem, AppBar, Toolbar, IconButton, Typography, 
  Button, Box, TextField, Container, Grid, Card, 
  CardContent, Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Avatar
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import { useHistory } from "react-router-dom";
import Lottie from "lottie-react";
import loadingAnimation from "./assets/animations/manload.json";


const Manufacturer = () => {
  const [manufacturer, setManufacturer] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isProfileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", id: "", role: "" });
  const itemsPerPage = 10;
  const history = useHistory();
  const userID = localStorage.getItem("userID");

  useEffect(() => {
    if (!userID) {
      alert("Unauthorized Access!");
      window.location.href = "/login";
      return;
    }
    fetchManufacturer();
    fetchMedicines();
  }, []);

  const fetchManufacturer = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/manufacturer/profile?userID=${userID}`);
      setManufacturer(res.data);
    } catch (err) {
      console.error("Error fetching manufacturer:", err);
    }
  };

  const fetchMedicines = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/manufacturer/view-medicines");
      setMedicines(res.data);
    } catch (err) {
      console.error("API Fetch Error:", err.response?.data || err.message);
      setError("Failed to load medicines. Please try again.");
    }
    setLoading(false);
  };

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("Token not found. Please log in.");
        return;
      }

      
      const response = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` }, 
      });

      if (response.status === 200 && response.data) {
        const { manufacturerName, id, role } = response.data; 
        console.log("Profile Data:", response.data);

        
        setProfileData({ username: manufacturerName, id, role });
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedMedicines = filteredMedicines.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Box sx={{ background: "linear-gradient(to right, #6a11cb, #2575fc)", minHeight: "100vh", paddingBottom: "30px" }}>
      <AppBar position="static" sx={{ background: "rgba(0, 0, 0, 0.8)" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {manufacturer ? `Welcome Back, ${manufacturer.name}! 👋` : "Loading..."}
          </Typography>
          <IconButton color="inherit" onClick={(e) => setMenuOpen(e.currentTarget)}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={menuOpen} open={Boolean(menuOpen)} onClose={() => setMenuOpen(null)}>
            <MenuItem disabled>
              <b>{manufacturer?.name}</b> (ID: {manufacturer?.userID})
            </MenuItem>
            <MenuItem onClick={() => { alert("📦 View Orders Clicked"); setMenuOpen(null); }}>📦 View Orders</MenuItem>
            <MenuItem onClick={handleProfileOpen}>👤 Profile</MenuItem>
            <MenuItem onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>
              <LogoutIcon sx={{ marginRight: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
          <TextField
            variant="outlined"
            placeholder="Search medicines..."
            fullWidth
            value={searchTerm}
            onChange={handleSearch}
            sx={{ maxWidth: 400, backgroundColor: "white", borderRadius: "8px" }}
            InputProps={{
              startAdornment: (
                <IconButton>
                  <SearchIcon />
                </IconButton>
              )
            }}
          />
        </Box>

        {loading ? (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
    <Lottie animationData={loadingAnimation} style={{ width: 200, height: 200 }} />
  </Box>
        ) : error ? (
          <Typography variant="h6" sx={{ mt: 3, textAlign: "center", color: "red" }}>
            {error}
          </Typography>
        ) : paginatedMedicines.length > 0 ? (
          <>
            <Grid container spacing={3} sx={{ mt: 4 }}>
              {paginatedMedicines.map((med, index) => (
                <Grid item xs={12} sm={6} md={4} key={med._id || index}>
                  <Card sx={{ maxWidth: 345, background: "#fff", boxShadow: 3, borderRadius: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{med.name || "Unknown"}</Typography>
                      <Typography color="textSecondary">💊 {med.type || "N/A"}</Typography>
                      <Typography color="textSecondary">🏭 {med.manufacturer_name || "N/A"}</Typography>
                      <Typography color="textSecondary">📦 Pack: {med.pack_size_label || "N/A"}</Typography>
                      <Typography color="textSecondary">💰 Price: ₹{med.price || "0"}</Typography>
                      <Typography color="textSecondary">📅 Expiry: {med.expiryDate || "N/A"}</Typography>
                      <Typography color={med.Is_discontinued ? "error" : "green"}>
                        {med.Is_discontinued ? "❌ Discontinued" : "✅ Available"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={Math.ceil(filteredMedicines.length / itemsPerPage)} page={page} onChange={(event, value) => setPage(value)} color="primary" />
            </Box>
          </>
        ) : (
          <Typography variant="h6" sx={{ mt: 3, textAlign: "center", color: "white" }}>
            No medicines found.
          </Typography>
        )}
      </Container>

    
      <Dialog open={isProfileDialogOpen} onClose={handleProfileClose} maxWidth="xs" fullWidth>
        <DialogTitle align="center">👤 Profile</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar 
              src={profileData.image || "https://via.placeholder.com/100"} 
              sx={{ width: 100, height: 100, bgcolor: "purple", mb: 2 }} 
            />
            <Typography variant="h6" mt={1}>{profileData.username || "Manufacturer's Name"}</Typography>
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

export default Manufacturer;
