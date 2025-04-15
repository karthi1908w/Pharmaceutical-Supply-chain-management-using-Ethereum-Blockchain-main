import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ViewMedicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicines = async () => {
      setLoading(true);
      setError(null);
      try {
        const userID = localStorage.getItem("userID"); // Get Manufacturer's ID
        if (!userID) {
          throw new Error("User ID is missing. Login again.");
        }

        console.log("📢 Fetching medicines for userID:", userID); // Debugging

        const res = await axios.get(`http://localhost:5000/manufacturer/view-medicines?userID=${userID}`);
        console.log("✅ API Response:", res.data); // Debugging

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid API response format.");
        }

        setMedicines(res.data);
      } catch (err) {
        console.error("❌ Error fetching medicines:", err);
        setError(err.response?.data?.message || "Failed to load medicines.");
      }
      setLoading(false);
    };

    fetchMedicines();
  }, []);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Available Medicines</h2>
      <Link to="/manufacturer" style={styles.backButton}>⬅ Back to Dashboard</Link>

      {loading ? (
        <p style={styles.loading}>⏳ Loading...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : medicines.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Manufacturer</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.id}>
                <td style={styles.td}>{medicine.id}</td>
                <td style={styles.td}>{medicine.name}</td>
                <td style={styles.td}>{medicine.manufacturer}</td>
                <td style={styles.td}>{medicine.stock}</td>
                <td style={styles.td}>₹{medicine.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={styles.noData}>⚠ No medicines available.</p>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: { textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" },
  title: { fontSize: "24px", fontWeight: "bold", marginBottom: "20px" },
  backButton: { display: "inline-block", marginBottom: "20px", textDecoration: "none", padding: "10px", background: "#007bff", color: "white", borderRadius: "5px" },
  loading: { fontSize: "18px", color: "#ff5722" },
  error: { fontSize: "18px", color: "red", marginTop: "10px" },
  noData: { fontSize: "18px", color: "#999", marginTop: "10px" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "20px" },
  th: { background: "#f4f4f4", padding: "10px", borderBottom: "2px solid #ddd", textAlign: "left" },
  td: { padding: "10px", borderBottom: "1px solid #ddd", textAlign: "left" }
};

export default ViewMedicines;
