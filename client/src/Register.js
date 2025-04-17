import React, { useState } from "react";
import Lottie from "lottie-react";
import axios from "axios";
import loadingAnimation from "./assets/animations/loading.json"; 

function Register() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Manufacturer");
  const [profilePic, setProfilePic] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("password", password);
    formData.append("role", role);

    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const res = await axios.post("https://pharma-backend-z97z.onrender.com/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { name, password, userID } = res.data;

      setTimeout(() => {
        setLoading(false);
        alert(`Registered Successfully!\nName: ${name}\nPassword: ${password}\nID: ${userID}`);
        localStorage.setItem("user", JSON.stringify({ name, userID, role }));
        window.location.href = "/login";
      }, 4000);
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  if (loading) {
    
    return (
      <div style={{ backgroundColor: "#fff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Lottie animationData={loadingAnimation} style={{ width: 100, height: 100 }} />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      <div style={{ flex: 1, backgroundImage: "url('images/csss.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}></div>

      
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        padding: "40px", background: "linear-gradient(to right, #d4fc79, #96e6a1)", boxShadow: "0px 0px 20px rgba(0, 0, 0, 0.2)"
      }}>
        
        
        <img 
          src="images/logo.png"  
          alt="Logo" 
          style={{ width: "120px", marginBottom: "20px" }} 
        />

        <h2 style={{ color: "#000435", fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}>Create Your Account</h2>

        <form style={{
          width: "80%", maxWidth: "400px", display: "flex", flexDirection: "column",
          padding: "30px", background: "#fff", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
        }} onSubmit={handleRegister}>

          <label>Name</label>
          <input type="text" placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} required 
            style={{ width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" }} />

          <label>Password</label>
          <input type="password" placeholder="Enter Password" value={password} onChange={(e) => setPassword(e.target.value)} required 
            style={{ width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" }} />

          <label>Confirm Password</label>
          <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
            style={{ width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" }} />

          <label>Upload Profile Picture (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setProfilePic(e.target.files[0])} 
            style={{ width: "100%", padding: "8px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px", background: "#f9f9f9" }} />

          <label>Select Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} 
            style={{ width: "100%", padding: "12px", marginBottom: "15px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" }}>
            <option>Manufacturer</option>
            <option>Distributor</option>
            <option>Customer</option>
            <option>Delivery Partner</option>
          </select>

          
          <button 
            type="submit"
            style={{
              background: isHovered ? "linear-gradient(to right, #c2e9fb, #a1c4fd)" : "linear-gradient(to right, #a1c4fd, #c2e9fb)",
              color: "#fff",
              padding: "12px",
              border: "none",
              borderRadius: "5px",
              fontSize: "18px",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
              transition: "0.4s ease-in-out",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={loading} 
          >
           Register
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;
