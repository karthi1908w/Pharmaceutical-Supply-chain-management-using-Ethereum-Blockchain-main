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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = "https://pharma-backend-z97z.onrender.com"; // Ensure this matches your backend URL

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track if the admin is authenticated
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(true); // Track if the password dialog is open
  const [passwordInput, setPasswordInput] = useState(""); // Track the entered password
  const [password, setPassword] = useState("admin@b300"); // Default password
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Track if the delete dialog is open
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false); // Track if the change password dialog is open
  const [oldPasswordInput, setOldPasswordInput] = useState(""); // Track old password for change password
  const [newPasswordInput, setNewPasswordInput] = useState(""); // Track new password for change password
  const [userToDelete, setUserToDelete] = useState(null); // Track the user to delete

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      axios
        .get(`${API_URL}/admin/users`)
        .then((res) => {
          console.log("Fetched users:", res.data); // Debugging
          setUsers(res.data);
        })
        .catch((err) => console.error("Error fetching users:", err))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const handlePasswordSubmit = () => {
    if (passwordInput === password) {
      setIsAuthenticated(true);
      setPasswordDialogOpen(false);
    } else {
      alert("Incorrect password!");
    }
  };

  const handleChangePassword = () => {
    if (oldPasswordInput === password) {
      setPassword(newPasswordInput);
      setChangePasswordDialogOpen(false);
      alert("Password changed successfully!");
    } else {
      alert("Incorrect old password!");
    }
  };

  const handleDelete = () => {
    if (passwordInput === password) {
      axios
        .delete(`${API_URL}/admin/users/${userToDelete}`)
        .then(() => {
          setUsers(users.filter((user) => user.userID !== userToDelete));
          setDeleteDialogOpen(false);
          alert("User deleted successfully!");
        })
        .catch((err) => console.error("Error deleting user:", err));
    } else {
      alert("Incorrect password!");
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
      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => {}}>
        <DialogTitle>Admin Login</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the admin password to access the dashboard.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordDialogOpen}
        onClose={() => setChangePasswordDialogOpen(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Old Password"
            type="password"
            fullWidth
            value={oldPasswordInput}
            onChange={(e) => setOldPasswordInput(e.target.value)}
          />
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={newPasswordInput}
            onChange={(e) => setNewPasswordInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleChangePassword} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the admin password to confirm user deletion.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {isAuthenticated && (
        <>
          <div className="text-center mb-10">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="mx-auto w-24 mb-4"
            />
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500">Manage all registered users</p>
            <Button
              onClick={() => setChangePasswordDialogOpen(true)}
              variant="contained"
              color="secondary"
              className="mt-4"
            >
              Change Password
            </Button>
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
                  {users.length === 0 ? (
                    <p className="text-center text-gray-500">No users found.</p>
                  ) : (
                    <TableBody>
                      {users.map((user, index) => (
                        <TableRow key={index}>
                          <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>{user.userID}</TableCell>
                          <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>{user.name}</TableCell>
                          <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>{user.role}</TableCell>
                          <TableCell className={`text-white font-semibold ${getRoleColor(user.role)}`}>
                            <IconButton
                              color="secondary"
                              onClick={() => {
                                setUserToDelete(user.userID);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  )}
                </Table>
              </TableContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
