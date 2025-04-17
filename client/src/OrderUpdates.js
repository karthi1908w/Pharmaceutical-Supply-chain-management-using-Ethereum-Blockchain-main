import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const OrderUpdates = () => {
  const [orderUpdates, setOrderUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderUpdates = async () => {
      try {
        const response = await axios.get("https://pharma-backend-z97z.onrender.com/api/orderupdates");
        setOrderUpdates(response.data);
      } catch (error) {
        console.error("Error fetching order updates:", error);
        setError("Failed to fetch order updates. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderUpdates();
  }, []);

  const handleShipOrder = async (orderId) => {
    console.log("Shipping order with ID:", orderId); 
    try {
      const response = await axios.put(`https://pharma-backend-z97z.onrender.com//api/orders/ship/${orderId}`);
      const updatedOrder = response.data;
      setOrderUpdates((prevUpdates) =>
        prevUpdates.map((update) =>
          update._id === updatedOrder._id ? { ...update, status: "Shipped" } : update
        )
      );
    } catch (error) {
      console.error("Error shipping order:", error);
      console.log(error.response); 
      setError("Failed to ship order. Please try again later.");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-4">Order Updates</h1>
      {loading ? (
        <p className="text-center text-muted">Loading order updates...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : orderUpdates.length > 0 ? (
        <div className="row">
          {orderUpdates.map((update) => (
            <div key={update._id} className="col-md-6 mb-4">
              <div className="card shadow-lg border-primary">
                <div className="card-body">
                  <h5 className="card-title">Order ID: <span className="text-success">{update._id}</span></h5>
                  <span className={`badge ${update.status === "Processed" ? "bg-warning text-dark" : "bg-primary"}`}>{update.status}</span>
                  <div className="mt-3">
                    <h6 className="text-primary">Customer Details:</h6>
                    <p><strong>Name:</strong> {update.customerDetails.name}</p>
                    <p><strong>House No:</strong> {update.customerDetails.houseNo}</p>
                    <p><strong>Street:</strong> {update.customerDetails.street}</p>
                    <p><strong>Locality:</strong> {update.customerDetails.locality}</p>
                    <p><strong>City:</strong> {update.customerDetails.city}</p>
                    <p><strong>State:</strong> {update.customerDetails.state}</p>
                    <p><strong>Pincode:</strong> {update.customerDetails.pincode}</p>
                  </div>
                  <div className="mt-3">
                    <h6 className="text-primary">Order Details:</h6>
                    <ul className="list-group">
                      {update.orderDetails.map((item, index) => (
                        <li key={index} className="list-group-item">
                          <p><strong>Name:</strong> {item.name}</p>
                          <p><strong>Price:</strong> ₹{item.price}</p>
                          <p><strong>Quantity:</strong> {item.quantity}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <p className="strong">Total Price: ₹{update.totalPrice}</p>
                    <p className="text-muted">Date: {new Date(update.date).toLocaleString()}</p>
                  </div>
                  <button className="btn btn-primary w-100 mt-3" onClick={() => handleShipOrder(update._id)}>Ship Order</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No order updates found.</p>
      )}
    </div>
  );
};

export default OrderUpdates;
