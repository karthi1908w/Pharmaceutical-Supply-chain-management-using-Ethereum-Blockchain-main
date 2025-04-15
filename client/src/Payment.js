import React, { useState } from "react";
import { useLocation, useHistory } from "react-router-dom"; // useHistory instead of useNavigate
import { ethers } from "ethers";
import { Button, Container, Paper, Typography } from "@mui/material";

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_manufacturer", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "makePayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

const Payment = () => {
  const location = useLocation();
  const history = useHistory();  // useHistory for navigation
  const { totalAmount } = location.state || {};
  const [loading, setLoading] = useState(false);

  if (!totalAmount) {
    alert("Invalid payment details!");
    history.push("/distributor");  // Updated to use history.push
    return null;
  }
  const pay = async () => {
    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const sender = accounts[0];
        const amount = "0.1"; // Amount in ETH

        const response = await fetch("http://localhost:5000/pay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, sender })
        });

        const data = await response.json();
        if (data.success) alert("Payment Successful!");
        else alert("Payment Failed: " + data.error);
    } catch (error) {
        console.error("Payment Error:", error);
    }
};

  const makePaymentWithMetaMask = async () => {
    try {
      if (!window.ethereum) {
        alert("❌ MetaMask is not installed!");
        return;
      }

      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tx = await contract.makePayment({ value: ethers.utils.parseEther(totalAmount.toString()) });

      console.log("✅ Transaction Hash:", tx.hash);
      alert(`✅ Payment Successful! Transaction Hash: ${tx.hash}`);

      setLoading(false);
      history.push("/distributor");  // Updated to use history.push
    } catch (error) {
      console.error("❌ Payment Error:", error);
      alert("❌ Payment failed! Check console.");
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 5, textAlign: "center" }}>
        <Typography variant="h5">💳 Confirm Payment</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>Amount: ₹{totalAmount}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={makePaymentWithMetaMask} 
          sx={{ mt: 3 }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay with MetaMask"}
        </Button>
      </Paper>
    </Container>
  );
};

export default Payment;
