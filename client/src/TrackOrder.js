import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgress, Box } from '@mui/material';

const TrackOrder = ({ customerId }) => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Customer ID:", customerId);
    const fetchCustomerOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/orderupdates/customer/${customerId}`);
        setOrders(response.data);
        setError(null);
      } catch (error) {
        console.error("Error fetching customer orders:", error);
        setError("Failed to fetch customer orders. Please try again later.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
  }, [customerId]);

  if (loading) {
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <h1>Track Orders</h1>
      {error && <p className="text-danger">{error}</p>}
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} style={{ border: '1px solid black', padding: '10px', marginTop: '10px' }}>
            <p><strong>Order ID:</strong> {order._id}</p>
            <p><strong>Customer Name:</strong> {order.customerDetails.name}</p>
            <p><strong>Address:</strong> {order.customerDetails.houseNo}, {order.customerDetails.street}, {order.customerDetails.locality}, {order.customerDetails.city}, {order.customerDetails.state}, {order.customerDetails.pincode}</p>
            <p><strong>Medicines:</strong> {order.orderDetails.map(item => `${item.name} - ${item.quantity} units @ ₹${item.price}`).join(', ')}</p>
            <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Expected Delivery:</strong> {order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleString() : 'N/A'}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default TrackOrder;