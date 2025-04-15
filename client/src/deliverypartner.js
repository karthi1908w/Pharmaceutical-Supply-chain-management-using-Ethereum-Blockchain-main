import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; 
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, Button, Form, Container, Row, Col } from "react-bootstrap";

const OTPInput = ({ length = 4, onChange }) => {
  const inputsRef = useRef([]);

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      onChange(e, index);
      if (value && index < length - 1) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  return (
    <div className="d-flex justify-content-between mt-3">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          ref={(el) => (inputsRef.current[index] = el)}
          className="form-control text-center border border-secondary"
          style={{ width: "50px", height: "50px", fontSize: "1.5rem" }}
          onChange={(e) => handleInputChange(e, index)}
        />
      ))}
    </div>
  );
};

const DeliveryPartner = () => {
  const [orders, setOrders] = useState([]);
  const [expectedDelivery, setExpectedDelivery] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [takenOrders, setTakenOrders] = useState({}); 

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orderupdates"); 
        console.log("Fetched Orders:", response.data); 
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
    }
  };

  const handleSetDelivery = async (orderId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/orders/set-delivery/${orderId}`, {
        expectedDelivery, 
      });
      console.log("Delivery date set:", response.data);

     
      const updatedOrders = await axios.get("http://localhost:5000/api/orderupdates");
      setOrders(updatedOrders.data);
      console.log("Updated Orders:", updatedOrders.data);
    } catch (error) {
      console.error("Error setting delivery date:", error);
    }
  };

  const handleTakeOrder = (orderId) => {
    setTakenOrders((prev) => ({ ...prev, [orderId]: true }));
  };

  return (
    <Container className="mt-4" style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", padding: "20px", borderRadius: "10px" }}>
      <h2 className="text-center mb-4 text-white bg-dark p-3 rounded">Delivery Partner Module</h2>
      <Row className="justify-content-center">
        <Col md={8}>
          {orders.length === 0 ? (
            <p className="text-center">No orders to display</p>
          ) : (
            orders.map((order, index) => (
              <Card key={index} className="p-3 shadow-lg border-0 mb-4" style={{ backgroundColor: "#ffffff" }}>
                <Card.Body>
                  <h5 className="text-primary">Orders to be Delivered</h5>
                  <div className="border p-3 rounded" style={{ backgroundColor: "#d1ecf1", border: "2px solid #0c5460" }}>
                    <p><strong className="text-dark">Customer:</strong> <span className="text-secondary">{order.customerDetails.name}</span></p>
                    <p><strong className="text-dark">Address:</strong> <span className="text-secondary">
                      {order.customerDetails.houseNo}, {order.customerDetails.street}, {order.customerDetails.locality}, {order.customerDetails.city}, {order.customerDetails.state}, {order.customerDetails.pincode}
                    </span></p>
                    <p><strong className="text-dark">Medicines:</strong></p>
                    <ul>
                      {order.orderDetails && order.orderDetails.map((medicine, medIndex) => (
                        <li key={medIndex} className="text-secondary">{medicine.name} - {medicine.quantity} units @ ₹{medicine.price}</li>
                      ))}
                    </ul>
                    {!takenOrders[order._id] ? (
                      <Button 
                        variant="warning" 
                        className="mt-3 w-100 shadow-sm"
                        onClick={() => handleTakeOrder(order._id)}
                      >
                        Take Order
                      </Button>
                    ) : (
                      <>
                        <Form.Group controlId={`deliveryDate-${index}`}>
                          <Form.Label className="text-dark">Expected Delivery Date & Time</Form.Label>
                          <Form.Control
                            type="datetime-local"
                            value={expectedDelivery}
                            onChange={(e) => setExpectedDelivery(e.target.value)}
                            className="bg-white text-dark border-0"
                          />
                        </Form.Group>
                        <Button 
                          variant="primary" 
                          className="mt-3 w-100 shadow-sm"
                          onClick={() => handleSetDelivery(order._id)}
                        >
                          Set Delivery
                        </Button>
                        <Button 
                          variant="success" 
                          className="mt-3 w-100 shadow-sm"
                          onClick={() => setShowOtpInput(true)}
                        >
                          Generate OTP
                        </Button>
                        {showOtpInput && (
                          <div className="mt-3">
                            <Form.Label className="text-dark">Enter OTP</Form.Label>
                            <OTPInput length={4} onChange={handleOtpChange} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default DeliveryPartner;
