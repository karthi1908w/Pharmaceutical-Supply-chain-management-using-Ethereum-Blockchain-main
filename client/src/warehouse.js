import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Doughnut, Line, Pie, Radar, PolarArea } from "react-chartjs-2";
import "chart.js/auto";
import Web3 from "web3";
import Lottie from "lottie-react";
import stockAnimation from "./assets/animations/stock.json";
import loadingAnimation from "./assets/animations/fast-delivery.json";
import salesIcon from "./assets/animations/sales-icon.json";
import { QRCodeCanvas } from "qrcode.react";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";


const TOTAL_STOCK = 1000;

const Warehouse = () => {
  const [account, setAccount] = useState("");
  const [soldMedicines, setSoldMedicines] = useState([]);
  const [remainingStockMedicines, setRemainingStockMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highestSoldMedicine, setHighestSoldMedicine] = useState(null);

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const loadBlockchainData = async () => {
    try {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
        fetchWarehouseData();
      }
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }
  };

  const fetchWarehouseData = async () => {
    setLoading(true);
    try {
      const response = await axios.get("https://pharma-backend-z97z.onrender.com/api/orders");
      const extractedMedicines = response.data.flatMap(order =>
        order.orderDetails.map(med => ({
          name: med.name,
          quantity: med.quantity
        }))
      );
      const aggregated = extractedMedicines.reduce((acc, curr) => {
        const found = acc.find(m => m.name === curr.name);
        if (found) found.quantity += curr.quantity;
        else acc.push({ name: curr.name, quantity: curr.quantity });
        return acc;
      }, []);
      setSoldMedicines(aggregated);
      const remaining = aggregated.map(med => ({
        name: med.name,
        remainingStock: TOTAL_STOCK - med.quantity
      }));
      setRemainingStockMedicines(remaining);
      const top = aggregated.reduce(
        (max, med) => (med.quantity > max.quantity ? med : max),
        { name: "", quantity: 0 }
      );
      setHighestSoldMedicine(top);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Sales Report", 20, 20);
    let y = 30;
    remainingStockMedicines.forEach((med, i) => {
      doc.text(`${i + 1}. ${med.name} - Remaining Stock: ${med.remainingStock}`, 20, y);
      y += 10;
    });
    doc.save("Sales_Report.pdf");
  };

  const csvData = [
    ["Medicine Name", "Remaining Stock"],
    ...remainingStockMedicines.map(med => [med.name, med.remainingStock]),
  ];

  const chartLabels = soldMedicines.map(m => m.name);
  const chartData = soldMedicines.map(m => m.quantity);

  const salesChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Medicines Sold",
        data: chartData,
        backgroundColor: [
          "#4e73df",
          "#1cc88a",
          "#36b9cc",
          "#f6c23e",
          "#e74a3b",
          "#858796",
          "#5a5c69"
        ],
        borderColor: "#ddd",
        borderWidth: 1
      }
    ]
  };

  const handleAddStock = async (medicineName) => {
    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();

      await web3.eth.sendTransaction({
        from: accounts[0],
        to: accounts[0],
        value: "0x0",
        gas: 21000,
      });

      setRemainingStockMedicines(prev =>
        prev.map(med =>
          med.name === medicineName ? { ...med, remainingStock: med.remainingStock + 100 } : med
        )
      );

      alert(`Stock added for ${medicineName}`);
    } catch (error) {
      console.error("Error adding stock:", error);
    }
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: "#f8fbff", minHeight: "100vh" }}>
    
      <h2 className="text-center mb-4" style={{ fontSize: "2.5rem" }}>📦 Warehouse Dashboard</h2>

      <div className="row mb-4 text-center">
        <div className="col-md-4">
          <div className="card shadow rounded p-3">
            <h5>Total Stock</h5>
            <p className="text-primary fs-4">{TOTAL_STOCK * soldMedicines.length}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow rounded p-3">
            <h5>Medicines Sold</h5>
            <p className="text-success fs-4">{soldMedicines.reduce((sum, m) => sum + m.quantity, 0)}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow rounded p-3">
            <h5>Low Stock Alerts</h5>
            <p className="text-danger fs-4">{remainingStockMedicines.filter(m => m.remainingStock < 200).length}</p>
          </div>
        </div>
      </div>

      <div className="card shadow rounded p-4 mb-4">
      <h4 className="mb-3">📊 Sales Charts</h4>
{loading ? (
  <div className="text-center">
    <Lottie animationData={loadingAnimation} style={{ width: 100, height: 100 }} />
    <p>Loading warehouse data...</p>
  </div>
) : (
  <div className="row">
  
    <div className="col-md-6 mb-4">
      <div className="card p-3 shadow rounded">
        <h5>Bar Chart</h5>
        <Bar data={salesChartData} options={{ responsive: true }} />
      </div>
    </div>


    <div className="col-md-6 mb-4">
      <div className="card p-3 shadow rounded">
        <h5>Doughnut Chart</h5>
        <Doughnut data={salesChartData} options={{ responsive: true }} />
      </div>
    </div>

    
    <div className="col-md-6 mb-4">
      <div className="card p-3 shadow rounded">
        <h5>Line Chart</h5>
        <Line data={salesChartData} options={{ responsive: true }} />
      </div>
    </div>

    
    <div className="col-md-6 mb-4">
      <div className="card p-3 shadow rounded">
        <h5>Pie Chart</h5>
        <Pie data={salesChartData} options={{ responsive: true }} />
      </div>
    </div>

    
    <div className="col-md-6 mb-4">
      <div className="card p-3 shadow rounded">
        <h5>Radar Chart</h5>
        <Radar data={salesChartData} options={{ responsive: true }} />
      </div>
    </div>

    
    <div className="col-md-6 mb-4">
      <div className="card p-3 shadow rounded">
        <h5>Polar Area Chart</h5>
        <PolarArea data={salesChartData} options={{ responsive: true }} />
      </div>
    </div>
  </div>
)}
      </div>

      <div className="d-flex justify-content-between mb-4">
        <button className="btn btn-outline-danger" onClick={exportPDF}>Export PDF</button>
        <CSVLink data={csvData} filename="Remaining_Stock_Report.csv" className="btn btn-outline-success">Export CSV</CSVLink>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow p-3 mb-4">
            <h5>📦 Ordered Medicines</h5>
            <ul className="list-group">
              {soldMedicines.map((med, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  {med.name} - Ordered: {med.quantity}
                  <QRCodeCanvas value={med.name} size={40} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow p-3 mb-4">
            <h5>📊 Remaining Stock</h5>
            <ul className="list-group">
              {remainingStockMedicines.map((med, i) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>{med.name} - Remaining: {med.remainingStock}</span>
                  {med.remainingStock < 200 && (
                    <button className="btn btn-sm btn-outline-primary" onClick={() => handleAddStock(med.name)}>
                      Add Stock
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card shadow p-3 mt-4 text-center">
        <h5>🏆 Highest Sold Medicine</h5>
        {highestSoldMedicine ? (
          <p className="fs-5 text-success">
            <strong>{highestSoldMedicine.name}</strong> ({highestSoldMedicine.quantity} sold)
          </p>
        ) : (
          <p>No data available.</p>
        )}
      </div>
    </div>
  );
};

export default Warehouse;
