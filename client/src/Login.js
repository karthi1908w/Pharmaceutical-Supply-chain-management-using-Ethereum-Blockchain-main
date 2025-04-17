import React, { useState } from "react";
import axios from "axios";
import Lottie from "lottie-react";
import loadingAnimation from "./assets/animations/medload.json"; 

const containerStyle = {
  display: "flex",
  height: "100vh",
};

const imageStyle = {
  flex: 1,
  backgroundImage: "url('images/mm.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const formContainerStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "#b6eb7a",
};

const formStyle = {
  width: "80%",
  maxWidth: "400px",
  display: "flex",
  flexDirection: "column",
  padding: "30px",
  background: "linear-gradient(to right, rgb(121, 252, 197), rgb(88, 192, 10))",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  alignItems: "center",
};

const logoStyle = {
  width: "80px",
  height: "80px",
  marginBottom: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  fontSize: "16px",
};

const buttonStyle = {
  background: "#004d4d",
  color: "#fff",
  padding: "12px",
  border: "none",
  borderRadius: "5px",
  fontSize: "18px",
  cursor: "pointer",
  fontWeight: "bold",
  width: "100%",
  transition: "0.4s ease-in-out",
};

const headingStyle = {
  color: "#004d4d",
  fontSize: "28px",
  fontWeight: "bold",
  marginBottom: "20px",
};

function Login() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userID, setUserID] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://pharma-backend-z97z.onrender.com/login", { name, password, userID });
      localStorage.setItem("authToken", res.data.token);
      localStorage.setItem("userID", res.data._id);
      localStorage.setItem("userRole", res.data.role);
      localStorage.setItem("userName", res.data.name);

      
      setTimeout(() => {
        setLoading(false);
        
        window.location.href = res.data.role === "Manufacturer" ? "/manufacturer"
          : res.data.role === "Distributor" ? "/distributor"
          : res.data.role === "Customer" ? "/customer"
          : "/deliverypartner";
      }, 4000);
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.message || "Login Failed. Try again.");
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
    <div style={containerStyle}>
      <div style={imageStyle}></div>
      <div style={formContainerStyle}>
        <form style={formStyle} onSubmit={handleLogin}>
          <img src="images/logo.png" alt="Logo" style={logoStyle} />
          <h2 style={headingStyle}>Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="4-Digit ID"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            required
            style={inputStyle}
          />
          <button type="submit" style={buttonStyle} disabled={loading}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
