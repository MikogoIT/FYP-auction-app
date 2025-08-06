import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { DataGrid, GridActionsCellItem, } from "@mui/x-data-grid";
import { 
  Box, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button as MuiButton,
  Alert,
  Snackbar
} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import Header from "../components/Header";
// import ModeEditIcon from '@mui/icons-material/ModeEdit';
// import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { Link } from "react-router";
import Button from "@mui/material/Button"
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

const AdminPage = () => {
  const [rows, setRows] = React.useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminWarning, setShowAdminWarning] = useState(false);
  const [showUpdateSuccess, setShowUpdateSuccess] = useState(false);
  const [updatedUserName, setUpdatedUserName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDuplicateError, setShowDuplicateError] = useState(false);
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 8,
  });
  const USERS_PER_PAGE = 10;

  const navigate = useNavigate(); 

  // update user's name, phone number, and address

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setCategoryMsg("");

    if (!newCategory.trim()) {
      setCategoryMsg("❌ Category name is required");
      return;
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newCategory }),
      });

      const data = await res.json();
      if (res.ok) {
        setCategoryMsg("Category created successfully");
        setNewCategory("");
      } else {
        setCategoryMsg("❌ " + (data.message || "Creation failed"));
      }
    } catch (err) {
      console.error("Create category error:", err);
      setCategoryMsg("❌ Server error");
    }
  };

  const fetchUsers = async (query = "", page = 1) => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/api/admin/search?q=${encodeURIComponent(query)}` 
        : `/api/admin/users`;

      const res = await fetch(endpoint, {
        credentials: "include", 
      });

      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
        setPage(page);
      } else {
        console.log(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Fetch/search users failed:", err);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    fetchUsers(searchQuery, 1); // Reset to first page on new search
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const handleEditUser = async (newRow, oldRow) => {
    // Check if the user being edited is an admin
    if (oldRow.is_admin) {
      setShowAdminWarning(true);
      return Promise.reject(oldRow); // Reject the promise to prevent the edit
    }

    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) {
      return newRow;
    }

    // Check for empty username
    if (!newRow.username || newRow.username.trim() === "") {
      setDuplicateErrorMessage("Username cannot be empty.");
      setShowDuplicateError(true);
      return Promise.reject(oldRow);
    }

    // Check for empty email
    if (!newRow.email || newRow.email.trim() === "") {
      setDuplicateErrorMessage("Email cannot be empty.");
      setShowDuplicateError(true);
      return Promise.reject(oldRow);
    }

    // Check for duplicate username
    const duplicateUsername = users.find(
      user => user.id !== newRow.id && user.username === newRow.username
    );
    if (duplicateUsername) {
      setDuplicateErrorMessage(`Username "${newRow.username}" is already taken by another user.`);
      setShowDuplicateError(true);
      return Promise.reject(oldRow); // Reject the promise to prevent the edit
    }

    // Check for duplicate email
    const duplicateEmail = users.find(
      user => user.id !== newRow.id && user.email === newRow.email
    );
    if (duplicateEmail) {
      setDuplicateErrorMessage(`Email "${newRow.email}" is already taken by another user.`);
      setShowDuplicateError(true);
      return Promise.reject(oldRow); // Reject the promise to prevent the edit
    }

    // Prevent duplicate updates
    if (isUpdating) {
      return Promise.reject(oldRow);
    }

    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/update/${newRow.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRow),
      });
      if (res.ok) {
        const updatedRowFromDB = await res.json();
        console.log("Status updated");
        
        // Show success notification only if not already showing
        if (!showUpdateSuccess) {
          setUpdatedUserName(updatedRowFromDB.username || newRow.username);
          setShowUpdateSuccess(true);
        }
        
        // Reload data while maintaining current search and page state
        await fetchUsers(searchQuery, page);
        
        // Reset updating flag after a short delay to allow for the dialog
        setTimeout(() => {
          setIsUpdating(false);
        }, 500);
        
        return updatedRowFromDB;
      } else {
        const data = await res.json();
        console.error("Error: " + data.message);
        setIsUpdating(false);
        return Promise.reject(oldRow);
      }
    } catch (err) {
      console.error("Request failed");
      setIsUpdating(false);
      return Promise.reject(oldRow);
    }
  };

  // Add error handler for processRowUpdate
  const handleProcessRowUpdateError = (error) => {
    console.log("Row update error handled:", error);
    // The dialogs are already shown in handleEditUser, so we just need to handle the error gracefully
  };

  const toggleFreeze = async (userId) => {
    // Find the user to check if they're an admin
    const user = users.find(u => u.id === userId);
    if (user && user.is_admin) {
      setShowAdminWarning(true);
      return;
    }

    try {
      const res = await fetch(`/api/admin/freeze/${userId}`, {
        method: "PUT",
        credentials: "include", 
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Status updated");
        fetchUsers();
      } else {
        console.log("Error: " + data.message);
      }
    } catch (err) {
      console.log("Request failed");
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/delete/${userId}`, {
        method: "DELETE",
        credentials: "include", 
      });
      const data = await res.json();
      if (res.ok) fetchUsers();
      else console.log(data.message || "Failed to delete user");
    } catch (err) {
      console.error("Delete user failed:", err);
    }
  };

  const handleDeleteClick = (id) => () => {
    deleteUser(id);
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSwitch = (id) => (event) => {
    // Find the user to check if they're an admin
    const user = users.find(u => u.id === id);
    if (user && user.is_admin) {
      setShowAdminWarning(true);
      return;
    }

    const updatedRows = rows.map((row) => 
      row.id === id ? { ...row, is_frozen: event.target.checked }: row
    );
    toggleFreeze(id)
    setRows(updatedRows);
  };

  const handleCloseWarning = () => {
    setShowAdminWarning(false);
  };

  const handleCloseDuplicateError = () => {
    setShowDuplicateError(false);
    setDuplicateErrorMessage("");
  };

  const handleCloseUpdateSuccess = () => {
    setShowUpdateSuccess(false);
    setUpdatedUserName(""); // Clear the username to prevent re-showing
    setIsUpdating(false); // Reset the updating flag when dialog is closed
  };

  useEffect(() => {
    fetchUsers(); // Initial load
  }, []);

  // Check if a cell should be editable (disable editing for admin users)
  const isCellEditable = (params) => {
    return !params.row.is_admin;
  };

  const column = [
    { 
      field: 'username', 
      headerName: 'Username', 
      editable: true,
      preProcessEditCellProps: (params) => {
        const { props, row } = params;
        const isEmpty = !props.value || props.value.trim() === "";
        const isDuplicate = users.some(
          (user) => user.id !== row.id && user.username === props.value
        );
        
        return {
          ...props,
          error: isDuplicate || isEmpty,
        };
      },
      isCellEditable: isCellEditable
    },
    { 
      field: 'email', 
      headerName: 'Email', 
      width: 200,
      editable: true,
      preProcessEditCellProps: (params) => {
        const { props, row } = params;
        const isEmpty = !props.value || props.value.trim() === "";
        const isDuplicate = users.some(
          (user) => user.id !== row.id && user.email === props.value
        );
        
        return {
          ...props,
          error: isDuplicate || isEmpty,
        };
      },
      isCellEditable: isCellEditable
    }, 
    { 
      field: 'phone_number', 
      headerName: 'Phone', 
      sortable: false, 
      editable: true,
      isCellEditable: isCellEditable
    }, 
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 200, 
      editable: true,
      isCellEditable: isCellEditable
    }, 
    { field: 'access', headerName: 'Access' , display: "flex", sortable: false, width: 150, renderCell: ({ row: {is_frozen} }) => {
      return (
        <Box
        width="100%"
        m="0 auto"
        p="5px"
        display="flex"
        justifyContent="center"
        borderRadius="4px"
        >
          {is_frozen && <AcUnitOutlinedIcon />}
          {!is_frozen && <ThumbUpOutlinedIcon />}
          <Typography sx={{ ml: "5px" }}>
            {
              is_frozen
                ? "Suspended"
                : "Active"
            }
          </Typography>
        </Box>
      );
      }
    }, 
    // working switch - disabled for admin users
    { field: "access_switch", headerName: "Suspended", display: 'flex', width: 100, sortable: false, filterable: false, renderCell: ({ row: {is_frozen, is_admin}, row: {id} }) => {
        const userId = id;
        const suspended = is_frozen

        return(
          <Switch
          checked={suspended}
          onChange={handleSwitch(userId)}
          disabled={is_admin} // Disable switch for admin users
          />
          
        );
      }
    },
    {field: "Access", headerName: "Role", display: "flex", width: 115, sortable: false, renderCell: ({ row: {is_admin} }) => {
      return (
        <Box
        width="100%"
        m="0 auto"
        p="5px"
        display="flex"
        justifyContent="center"
        borderRadius="4px"
        >
          {is_admin && <AdminPanelSettingsOutlinedIcon />}
          {!is_admin && <Person4OutlinedIcon />}
          <Typography sx={{ ml: "5px" }}>
            {
              is_admin
                ? "Admin"
                : "User"
            }
          </Typography>
        </Box>
      );
    }
  },
  /* delete user, kept code just in case
 {
    field: 'id',
    type: 'actions',
    headerName: 'Actions',
    display: "flex",
    cellClassName: 'actions',
    getActions: ({ id }) => {


      return [
        <GridActionsCellItem
          icon={<DeleteOutlinedIcon />}
          label="Delete User"
          onClick={handleDeleteClick(id)}
        />,
      ];
    },
  },
  */
]


  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">

        {/* page title */}
        <div className="profileTitle">Admin Dashboard
          <Stack direction="row" spacing={2}>
              <Button 
              variant="contained"
              component={Link}
              to="/admin"
              color="primary"
              >
                User Management</Button>
              <Button
              variant="outlined"
              component={Link}
              to="/admin/categoryadmin"
              sx={{
                borderColor: "grey.400",
                color: "grey.500",
                "&:hover": {borderColor: "grey.600"}
              }}
              >
                Category Management</Button>
          </Stack>
        </div>
        <Box
          m="40px 0 0 0"
          sx={{
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
            },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              color: "#000000"
            },
            "& .MuiCheckbox-root": {
            },
            // Style for non-editable cells (admin users)
            "& .MuiDataGrid-cell--editable": {
              backgroundColor: "transparent",
            },
            "& .MuiDataGrid-row": {
              "&:has([data-field='is_admin'][data-value='true'])": {
                "& .MuiDataGrid-cell--editable": {
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                }
              }
            }
          }}
      >
        <DataGrid 
          rows={users}
          editMode="row"
          columns={column}
          processRowUpdate={handleEditUser}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          isCellEditable={isCellEditable}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 8, 10]}
          sx={{
            color: "#000000",
          }}
          width="100%"
          disableRowSelectionOnClick
          loading={loading}
          showToolbar
        />
      </Box>

      {/* Admin Warning Dialog - Material Design 3 */}
      <Dialog
        open={showAdminWarning}
        onClose={handleCloseWarning}
        aria-labelledby="admin-warning-dialog-title"
        aria-describedby="admin-warning-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
            maxWidth: 512,
            padding: 2,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle 
          id="admin-warning-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '16px 0',
            fontSize: '1.375rem',
            fontWeight: 600,
            color: '#DC362E'
          }}
        >
          <WarningIcon sx={{ color: '#DC362E', fontSize: 28 }} />
          Admin Protection
        </DialogTitle>
        <DialogContent sx={{ padding: '0 0 24px 0' }}>
          <Typography 
            id="admin-warning-dialog-description"
            sx={{
              color: 'rgba(0, 0, 0, 0.87)',
              fontSize: '1rem',
              lineHeight: 1.5
            }}
          >
            Admin users cannot be edited or suspended for security reasons. Only non-admin users can be modified.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 0, justifyContent: 'flex-end' }}>
          <MuiButton 
            onClick={handleCloseWarning}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              padding: '10px 24px',
              backgroundColor: '#DC362E',
              '&:hover': {
                backgroundColor: '#B71C1C'
              }
            }}
          >
            Understood
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* User Update Success Dialog - Material Design 3 */}
      <Dialog
        open={showUpdateSuccess}
        onClose={handleCloseUpdateSuccess}
        aria-labelledby="update-success-dialog-title"
        aria-describedby="update-success-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
            maxWidth: 512,
            padding: 2,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle 
          id="update-success-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '16px 0',
            fontSize: '1.375rem',
            fontWeight: 600,
            color: '#0F7B0F'
          }}
        >
          <CheckCircleIcon sx={{ color: '#0F7B0F', fontSize: 28 }} />
          User Updated
        </DialogTitle>
        <DialogContent sx={{ padding: '0 0 24px 0' }}>
          <Typography 
            id="update-success-dialog-description"
            sx={{
              color: 'rgba(0, 0, 0, 0.87)',
              fontSize: '1rem',
              lineHeight: 1.5
            }}
          >
            User "{updatedUserName}" has been successfully updated.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 0, justifyContent: 'flex-end' }}>
          <MuiButton 
            onClick={handleCloseUpdateSuccess}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              padding: '10px 24px',
              backgroundColor: '#e8def8',
              color: '#000000',
              '&:hover': {
                backgroundColor: '#6750a4',
                color: "#FFFFFF",
              }
            }}
          >
            OK
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Duplicate Value Error Dialog - Material Design 3 (Same style as Admin Warning) */}
      <Dialog
        open={showDuplicateError}
        onClose={handleCloseDuplicateError}
        aria-labelledby="duplicate-error-dialog-title"
        aria-describedby="duplicate-error-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 320,
            maxWidth: 512,
            padding: 2,
            boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.08)'
          }
        }}
      >
        <DialogTitle 
          id="duplicate-error-dialog-title"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            padding: '16px 0',
            fontSize: '1.375rem',
            fontWeight: 600,
            color: '#DC362E'
          }}
        >
          <WarningIcon sx={{ color: '#DC362E', fontSize: 28 }} />
          Duplicate Value Warning
        </DialogTitle>
        <DialogContent sx={{ padding: '0 0 24px 0' }}>
          <Typography 
            id="duplicate-error-dialog-description"
            sx={{
              color: 'rgba(0, 0, 0, 0.87)',
              fontSize: '1rem',
              lineHeight: 1.5
            }}
          >
            {duplicateErrorMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ padding: 0, justifyContent: 'flex-end' }}>
          <MuiButton 
            onClick={handleCloseDuplicateError}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              padding: '10px 24px',
              backgroundColor: '#DC362E',
              '&:hover': {
                backgroundColor: '#B71C1C'
              }
            }}
          >
            Understood
          </MuiButton>
        </DialogActions>
      </Dialog>

      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
};

export default AdminPage;