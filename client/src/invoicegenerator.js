import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useHistory } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]); 
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [customers, setCustomers] = useState([]); 
  const [showCustomerModal, setShowCustomerModal] = useState(false); 

  const history = useHistory();


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/orders"); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched Orders:", data); 
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);


  const fetchCustomers = async () => {
    console.log("Send button clicked! Fetching customers...");
    try {
      const response = await fetch("http://localhost:5000/api/users"); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched Customers:", data); 
      setCustomers(data);
      setShowCustomerModal(true); 
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };


  const handleCustomerSelect = async (customerId) => {
    if (!selectedOrder) {
      console.error("No selected order");
      return;
    }

    const selectedCustomer = customers.find((customer) => customer._id === customerId);

    if (!selectedCustomer) {
      console.error("Customer not found");
      return;
    }

    try {
      const invoiceData = {
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.name,
        orderDetails: selectedOrder.orderDetails,
        totalPrice: selectedOrder.totalPrice,
        date: new Date(selectedOrder.date).toLocaleDateString(),
      };

      console.log("Invoice Data:", invoiceData);

      const response = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Invoice created successfully:", data);

      setShowCustomerModal(false);
      history.push(`/invoices/${customerId}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
    }
  };

  const handlePreview = (order) => {
    setSelectedOrder(order); 
  };

  const handleDownload = () => {
    if (!selectedOrder) return;
    const doc = new jsPDF({ format: "a4" });
    doc.text("INVOICE", 20, 20);
    doc.addImage("/logo.png", "PNG", 160, 10, 30, 30);
    doc.text(`Customer Name: ${selectedOrder.customerDetails.name}`, 20, 40);
    doc.text(
      `Address: ${selectedOrder.customerDetails.houseNo}, ${selectedOrder.customerDetails.street},`,
      20,
      50
    );
    doc.text(
      `${selectedOrder.customerDetails.locality}, ${selectedOrder.customerDetails.city}, ${selectedOrder.customerDetails.state},`,
      20,
      60
    );
    doc.text(
      `Pincode: ${selectedOrder.customerDetails.pincode}`,
      20,
      70
    );
    doc.text("Order Details:", 20, 90);
    selectedOrder.orderDetails.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.name} - Qty: ${item.quantity} - Price: INR ${item.price}`,
        20,
        100 + index * 10
      );
    });
    doc.text(
      `Total Price: INR ${selectedOrder.totalPrice}`,
      20,
      120 + selectedOrder.orderDetails.length * 10
    );
    doc.text(
      `Date: ${new Date(selectedOrder.date).toLocaleDateString()}`,
      20,
      130 + selectedOrder.orderDetails.length * 10
    );
    doc.text("Authorized Signature", 150, 280);
    doc.save("invoice.pdf");
  };

  const exportPDF = async () => {
    const invoiceElement = document.getElementById("invoice-section");
    const downloadButton = document.getElementById("download-button"); 
    if (!invoiceElement) {
      console.error("Invoice section not found!");
      return;
    }
  
    try {
      
      const images = invoiceElement.getElementsByTagName("img");
      for (let img of images) {
        if (!img.complete) await new Promise((resolve) => img.onload = resolve);
      }
      if (downloadButton) {
        downloadButton.style.visibility = "hidden"; 
      }
      const canvas = await html2canvas(invoiceElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
  
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
      pdf.save("invoice.pdf");
      if (downloadButton) {
        downloadButton.style.display = "none";
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
     } finally {
       
        if (downloadButton) {
          downloadButton.classList.remove("hidden-download-btn");
        }
      
    }
  };
  
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Orders</h1>
      <div className="row">
        {orders.length > 0 ? (
          orders.map((order, index) => (
            <div className="col-md-4 mb-4" key={index}>
              <div className="card shadow-lg">
                <div className="card-body">
                  <h5 className="card-title">Order ID: {order._id}</h5>
                  <p className="card-text">
                    Customer: {order.customerDetails.name}
                  </p>
                  <p className="card-text">
                    Total Price: INR {order.totalPrice}
                  </p>
                  <p className="card-text">
                    Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                  <button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => handlePreview(order)}
                  >
                    Preview
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={fetchCustomers}
                    disabled={!selectedOrder} 
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No orders found.</p>
        )}
      </div>

      
      {showCustomerModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Select Customer</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCustomerModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ul className="list-group">
                  {customers.map((customer) => (
                    <li
                      key={customer._id}
                      className="list-group-item list-group-item-action"
                      onClick={() => handleCustomerSelect(customer._id)}
                      style={{ cursor: "pointer" }}
                    >
                      {customer.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <div id="invoice-section" className="card mt-4 shadow-lg">
          <div className="card-header bg-danger text-white text-center">
            <h2 className="h5">INVOICE</h2>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h5><strong>Customer Name</strong></h5>
                <p>{selectedOrder.customerDetails.name}</p>
                <p>
                  <strong>Address</strong>: {selectedOrder.customerDetails.houseNo},{" "}
                  {selectedOrder.customerDetails.street},{" "}
                  {selectedOrder.customerDetails.locality},{" "}
                  {selectedOrder.customerDetails.city},{" "}
                  {selectedOrder.customerDetails.state},{" "}
                  {selectedOrder.customerDetails.pincode}
                </p>
              </div>
              <div className="col-md-6 text-end" style={{ position: "relative" }}>
                <img
                  src="/images/logo.png"
                  alt="Logo"
                  style={{
                    maxWidth: "100px",
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                  }}
                />
              </div>
            </div>
            <hr />
            <br />
            <h5>Order Details</h5>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.orderDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>INR {item.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br /><br /><br />
            <div className="text-end mt-4 mb-5">
              {(() => {
                const gst = selectedOrder.totalPrice * 0.1; 
                const cgst = selectedOrder.totalPrice * 0.1; 
                const totalWithTaxes = selectedOrder.totalPrice + gst + cgst;

                return (
                  <div style={{ textAlign: "right" }}> 
                    <p><strong>Subtotal (Including GST & CGST):</strong> INR {totalWithTaxes.toFixed(2)}</p>
                    <h4 className="text-danger fw-bold">TOTAL: INR {totalWithTaxes.toFixed(2)}</h4>
                  </div>
                );
              })()}
            </div>
            <p>Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
            <br /><br />
         <div>   <img
    src="/images/pr.png" 
    style={{ maxWidth: "150px", marginTop: "10px" }}
  />
</div>
            <div className="text-center">
              <img
                src="/images/stamp.png"
                alt="Company Stamp"
                style={{ maxWidth: "150px", opacity: 0.8 }}
              />
</div>
            <p className="text-center"><strong>Thanks for shopping!</strong></p>
            <br /><br /><br />
            <button className="btn btn-success w-100" onClick={exportPDF}>
              Download as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;