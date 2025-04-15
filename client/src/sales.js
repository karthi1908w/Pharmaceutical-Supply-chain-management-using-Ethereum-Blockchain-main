import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sales = () => {
    const [orders, setOrders] = useState([]);
    const [newOrder, setNewOrder] = useState([{ name: '', quantity: '' }]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/orders");
                
                setOrders(response.data.filter(order => !order.finished && !order.sent));
            } catch (error) {
                console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();
    }, []);

    const handleAddOrder = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/sales", {
                orderDetails: newOrder,
            });
            setOrders([...orders, response.data.order]);
            setNewOrder([{ name: '', quantity: '' }]);         } catch (error) {
            console.error("Error adding order:", error);
        }
    };

    const handleInputChange = (index, field, value) => {
        const updatedOrder = [...newOrder];
        updatedOrder[index][field] = value;
        setNewOrder(updatedOrder);
    };

    const addMedicineField = () => {
        setNewOrder([...newOrder, { name: '', quantity: '' }]);
    };

    const markOrderAsFinished = async (orderId) => {
        try {
            await axios.put(`http://localhost:5000/api/orders/${orderId}`, { finished: true });
        
            setOrders(orders.filter(order => order._id !== orderId));
        } catch (error) {
            console.error("Error marking order as finished:", error);
        }
    };

    const sendOrder = async (orderId) => {
        try {
            const response = await axios.post("http://localhost:5000/api/sales", { orderId });

            
            setOrders(orders.filter(order => order._id !== orderId));

            console.log("Order sent successfully:", response.data);
        } catch (error) {
            console.error("Error sending order:", error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Orders</h2>

         

            
            <div>
                {orders.length > 0 ? (
                    orders.map((order, index) => (
                        <div
                            key={index}
                            style={{
                                border: '1px solid #ccc',
                                padding: '15px',
                                borderRadius: '5px',
                                marginBottom: '15px',
                                backgroundColor: '#f9f9f9',
                            }}
                        >
                            <strong>Medicines:</strong>
                            <ul>
                                {order.orderDetails.map((medicine, idx) => (
                                    <li key={idx}>
                                        {medicine.name} - Quantity: {medicine.quantity}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => markOrderAsFinished(order._id)}
                                style={{ backgroundColor: '#f44336', color: 'white', marginTop: '10px', marginRight: '10px' }}
                            >
                                Finish
                            </button>
                            <button
                                onClick={() => sendOrder(order._id)}
                                style={{ backgroundColor: '#4CAF50', color: 'white', marginTop: '10px' }}
                            >
                                Send Order
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No orders found.</p>
                )}
            </div>
        </div>
    );
};

export default Sales;