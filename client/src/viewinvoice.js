import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
} from "@mui/material";

const ViewInvoice = () => {
  const [invoices, setInvoices] = useState([]); 
  const [selectedInvoice, setSelectedInvoice] = useState(null); 
  const [isViewInvoiceDialogOpen, setViewInvoiceDialogOpen] = useState(false); 


  const fetchInvoices = async () => {
    try {
      const response = await axios.get("https://pharma-backend-z97z.onrender.com/api/invoices"); 
      if (response.status === 200) {
        setInvoices(response.data); 
      } else {
        console.error("Failed to fetch invoices:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };
  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice); 
    setViewInvoiceDialogOpen(true); 
  };

  
  const handleCloseInvoiceDialog = () => {
    setViewInvoiceDialogOpen(false); 
  };

  
  const exportPDF = async () => {
    const invoiceElement = document.getElementById("invoice-section");
    if (!invoiceElement) {
      console.error("Invoice section not found!");
      return;
    }

    const jsPDF = (await import("jspdf")).default;
    const html2canvas = (await import("html2canvas")).default;

    try {
      const canvas = await html2canvas(invoiceElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, imgWidth, imgHeight);
      pdf.save("invoice.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  
  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <Box sx={{ padding: "20px" }}>
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        View Invoices
      </Typography>

      
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gradient-to-r from-red-500 to-green-500 text-white">
            <tr>
              <th className="py-3 px-4 border-b text-left font-semibold">Order ID</th>
              <th className="py-3 px-4 border-b text-left font-semibold">Customer Name</th>
              <th className="py-3 px-4 border-b text-left font-semibold">Total Price</th>
              <th className="py-3 px-4 border-b text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-100">
                <td className="py-3 px-4 border-b">{invoice._id}</td>
                <td className="py-3 px-4 border-b">{invoice.customerName}</td>
                <td className="py-3 px-4 border-b">₹{invoice.totalPrice}</td>
                <td className="py-3 px-4 border-b">
                  <button
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-1 px-4 rounded hover:from-green-600 hover:to-blue-600"
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    Preview
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      
      <Dialog
        open={isViewInvoiceDialogOpen}
        onClose={handleCloseInvoiceDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle align="center" sx={{ backgroundColor: "red", color: "white" }}>
          INVOICE
        </DialogTitle>

        <DialogContent>
          {selectedInvoice ? (
            <div className="bg-white rounded-xl shadow-lg p-6 space-y-6" id="invoice-section">
            
              <div className="flex justify-between items-start">
                
                <div>
                  <h2 className="text-lg font-semibold text-gray-700">Customer Name</h2>
                  <p className="text-gray-800 mt-1">{selectedInvoice.customerName}</p>
                 
                  <p className="text-gray-600 mt-1">
                    <strong>Order ID:</strong> {selectedInvoice._id}
                  </p>
                </div>

                
                <div className="w-24">
                  <img src="/images/logo.png" alt="Logo" className="w-full h-auto object-contain" />
                </div>
              </div>

              <hr className="border-t border-gray-300" />

              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Details</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm border-gray-200 text-left">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.orderDetails.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{item.name}</td>
                          <td className="py-2 px-4 border-b text-right">₹ {item.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              
              <div className="text-right space-y-1">
                {(() => {
                  const gst = selectedInvoice.totalPrice * 0.1;
                  const cgst = selectedInvoice.totalPrice * 0.1;
                  const totalWithTaxes = selectedInvoice.totalPrice + gst + cgst;

                  return (
                    <>
                      <p className="text-gray-600">Subtotal: ₹ {selectedInvoice.totalPrice.toFixed(2)}</p>
                      <p className="text-gray-600">GST (10%): ₹ {gst.toFixed(2)}</p>
                      <p className="text-gray-600">CGST (10%): ₹ {cgst.toFixed(2)}</p>
                      <h4 className="text-xl font-bold text-red-600 mt-2">
                        TOTAL: ₹ {totalWithTaxes.toFixed(2)}
                      </h4>
                    </>
                  );
                })()}
              </div>

              <p className="text-sm text-gray-500">
                Date: {new Date(selectedInvoice.date).toLocaleDateString()}
              </p>

              
              <div className="flex justify-between items-end mt-6">
                
                <div className="w-40">
                  <img src="/images/pr.png" alt="Signature" className="w-full h-auto" />
                </div>

                
                <div className="flex justify-center w-full">
                  <img
                    src="/images/stamp.png"
                    alt="Company Stamp"
                    className="w-40 opacity-80"
                  />
                </div>
              </div>
            </div>
          ) : (
            <Typography>No invoice selected.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button id="download-button" onClick={exportPDF} color="primary">
            Download as PDF
          </Button>
          <Button onClick={handleCloseInvoiceDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewInvoice;
