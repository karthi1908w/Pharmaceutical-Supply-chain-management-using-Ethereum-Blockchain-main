import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { Button, TextField, Paper, Typography, Box } from '@mui/material';

const PaymentPage = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.enable();
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = YourContract.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          YourContract.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);
      } else {
        alert('MetaMask not found!');
      }
    };
    loadWeb3();
  }, []);

  const handlePayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount)) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const amountInWei = web3.utils.toWei(paymentAmount, 'ether');
      await contract.methods.makePayment().send({
        from: account,
        value: amountInWei
      });

      // Send payment details to backend after successful payment
      const response = await fetch('http://localhost:5000/api/payment/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transactionHash: 'your_transaction_hash_here', // Replace with actual transaction hash
          amount: paymentAmount,
          userAccount: account
        })
      });

      if (response.ok) {
        alert('Payment confirmed! Order placed successfully.');
      } else {
        alert('Payment confirmation failed!');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed!');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Paper sx={{ padding: 3 }}>
        <Typography variant="h6">Make a Payment</Typography>
        <TextField
          label="Amount (ETH)"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? 'Processing Payment...' : 'Pay with MetaMask'}
        </Button>
      </Paper>
    </Box>
  );
};

export default PaymentPage;
