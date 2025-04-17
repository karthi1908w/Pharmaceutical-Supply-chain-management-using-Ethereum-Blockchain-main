import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ViewOrder = () => {
  const [orders, setOrders] = useState([]);
  const [shippedOrders, setShippedOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("https://pharma-backend-z97z.onrender.com/api/orders");
        console.log("Fetched orders:", response.data);

        
        const nonShippedOrders = response.data.filter(order => order.status !== "Shipped");
        const shippedOrdersList = response.data.filter(order => order.status === "Shipped");

        setOrders(nonShippedOrders);
        setShippedOrders(shippedOrdersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) =>
    order.customerDetails?.name?.toLowerCase().includes(search.toLowerCase()) ||
    order._id.includes(search)
  );

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleProcessOrder = (orderId) => {
  
    const orderToShip = orders.find((order) => order._id === orderId);

    if (orderToShip) {
      
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));

  
      setShippedOrders((prevShippedOrders) => [
        ...prevShippedOrders,
        { ...orderToShip, status: "Shipped" },
      ]);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-4">View Orders</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Order ID or Customer Name"
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="text-center text-muted">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-danger">{error}</p>
      ) : (
        <>
          
          <h2 className="text-primary">Pending Orders</h2>
          {currentOrders.length > 0 ? (
            <div className="row">
              {currentOrders.map((order) => (
                <div key={order._id} className="col-md-6 mb-4">
                  <div className="card shadow-lg border-primary" style={{ background: "linear-gradient(to right, #87CEFA, #90EE90)" }}>
                    <div className="card-body">
                      <h5 className="card-title">Order ID: <span className="text-success">{order._id}</span></h5>
                      <span className={`badge ${order.status === "Pending" ? "bg-warning text-dark" : "bg-primary"}`}>{order.status || "Pending"}</span>

                      <div className="mt-3">
                        <h6 className="text-primary">Customer Details:</h6>
                        <p><strong>Name:</strong> {order.customerDetails?.name || "N/A"}</p>
                        <p><strong>City:</strong> {order.customerDetails?.city || "N/A"}</p>
                        <p><strong>State:</strong> {order.customerDetails?.state || "N/A"}</p>
                        <p><strong>Pincode:</strong> {order.customerDetails?.pincode || "N/A"}</p>
                      </div>

                      <div className="mt-3 p-3 rounded" style={{ background: "linear-gradient(to right, #87CEFA, #90EE90)" }}>
                        <h6 className="text-primary">Order Details:</h6>
                        <ul className="list-group">
                          {order.orderDetails.map((item) => (
                            <li key={item._id} className="list-group-item" style={{ background: "linear-gradient(to right, #87CEFA, #90EE90)" }}>
                              <p><strong>Name:</strong> {item.name}</p>
                              <p><strong>Price:</strong> ₹{item.price}</p>
                              <p><strong>Quantity:</strong> {item.quantity}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <p className="strong">Total Price: ₹{order.totalPrice}</p>
                        <p className="text-muted">Date: {new Date(order.date).toLocaleString()}</p>
                      </div>

                      
                      {order.status !== "Shipped" && (
                        <button className="btn btn-primary w-100" onClick={() => handleProcessOrder(order._id)}> Ship Order</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No pending orders found.</p>
          )}

          
          <h2 className="text-primary mt-5">Shipped Orders</h2>
          {shippedOrders.length > 0 ? (
            <div className="row">
              {shippedOrders.map((order) => (
                <div key={order._id} className="col-md-6 mb-4">
                  <div className="card shadow-lg border-success" style={{ background: "linear-gradient(to right, #90EE90, #87CEFA)" }}>
                    <div className="card-body">
                      <h5 className="card-title">Order ID: <span className="text-success">{order._id}</span></h5>
                      <span className="badge bg-success">Shipped</span>

                      <div className="mt-3">
                        <h6 className="text-primary">Customer Details:</h6>
                        <p><strong>Name:</strong> {order.customerDetails?.name || "N/A"}</p>
                        <p><strong>City:</strong> {order.customerDetails?.city || "N/A"}</p>
                        <p><strong>State:</strong> {order.customerDetails?.state || "N/A"}</p>
                        <p><strong>Pincode:</strong> {order.customerDetails?.pincode || "N/A"}</p>
                      </div>

                      <div className="mt-3 p-3 rounded" style={{ background: "linear-gradient(to right, #90EE90, #87CEFA)" }}>
                        <h6 className="text-primary">Order Details:</h6>
                        <ul className="list-group">
                          {order.orderDetails.map((item) => (
                            <li key={item._id} className="list-group-item" style={{ background: "linear-gradient(to right, #90EE90, #87CEFA)" }}>
                              <p><strong>Name:</strong> {item.name}</p>
                              <p><strong>Price:</strong> ₹{item.price}</p>
                              <p><strong>Quantity:</strong> {item.quantity}</p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <p className="strong">Total Price: ₹{order.totalPrice}</p>
                        <p className="text-muted">Date: {new Date(order.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted">No shipped orders found.</p>
          )}
        </>
      )}

      <div className="d-flex justify-content-center mt-4">
        <div className="mx-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            Previous
          </button>
        </div>
        <div className="mx-2">
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastOrder >= filteredOrders.length}
            className="btn btn-outline-primary"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewOrder;
