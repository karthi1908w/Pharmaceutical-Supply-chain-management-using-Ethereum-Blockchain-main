import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = "https://pharma-backend-z97z.onrender.com";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/admin/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (userID) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (isConfirmed) {
      axios
        .delete(`${API_URL}/admin/users/${userID}`)
        .then(() => {
          setUsers(users.filter((user) => user.userID !== userID));
        })
        .catch((err) => console.error("Error deleting user:", err));
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-500";
      case "Manufacturer":
        return "bg-green-500";
      case "Distributor":
        return "bg-blue-500";
      case "Customer":
        return "bg-yellow-500";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <img
          src="/images/logo.png"
          alt="Logo"
          className="mx-auto w-24 mb-4"
        />
        <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500">Manage all registered users</p>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <CircularProgress />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-4">
          <TableContainer component={Paper} className="rounded-md">
            <Table>
              <TableHead>
                <TableRow className="bg-blue-600">
                  <TableCell className="text-white font-bold">ID</TableCell>
                  <TableCell className="text-white font-bold">Name</TableCell>
                  <TableCell className="text-white font-bold">Role</TableCell>
                  <TableCell className="text-white font-bold">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>{user.userID}</TableCell>
                    <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>{user.name}</TableCell>
                    <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>{user.role}</TableCell>
                    <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>
                      <IconButton
                        color="secondary"
                        onClick={() => handleDelete(user.userID)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};

export default Admin;
