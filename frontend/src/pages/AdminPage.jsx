import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { DataGrid, GridActionsCellItem, GridRowEditStopReasons } from "@mui/x-data-grid";
import { 
  Box, 
  Typography, 
  Alert,
  Snackbar
} from "@mui/material";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Header from "../components/Header";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [rowModesModel, setRowModesModel] = React.useState({});

  // State for notifications (Snackbar)
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'warning'

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 8,
  });
  const USERS_PER_PAGE = 10;

  const navigate = useNavigate(); 

  // Show notification (success or warning)
  const showNotification = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setNotificationOpen(true);
  };

  // Show success notification (for backward compatibility)
  const showSuccessNotification = (message) => {
    showNotification(message, 'success');
  };

  // Show admin warning notification
  const showAdminWarning = () => {
    showNotification('Admin users cannot be edited or suspended for security reasons', 'warning');
  };

  // Close notification
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificationOpen(false);
  };

  // Handle row edit stop
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  // Handle edit click
  const handleEditClick = (id) => () => {
    // Check if the user being edited is an admin
    const user = users.find(u => u.id === id);
    if (user && user.is_admin) {
      showAdminWarning();
      return;
    }
    setRowModesModel({ ...rowModesModel, [id]: { mode: 'edit' } });
  };

  // Handle save click
  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: 'view' } });
  };

  // Handle cancel click
  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: 'view', ignoreModifications: true },
    });
  };

  // Handle row modes model change
  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

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
        setRows(data.users); // Update rows state as well
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
      showAdminWarning();
      throw new Error('Admin users cannot be edited');
    }

    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) {
      return newRow;
    }

    // Check for empty username
    if (!newRow.username || newRow.username.trim() === "") {
      throw new Error('Username cannot be empty');
    }

    // Check for empty email 
    // Check for empty email 
    if (!newRow.email || newRow.email.trim() === "") {
      throw new Error('Email cannot be empty');
    }

    // Check for duplicate username
    const duplicateUsername = users.find(
      user => user.id !== newRow.id && user.username === newRow.username
    );
    if (duplicateUsername) {
      throw new Error('Username already exists');
    }

    // Check for duplicate email
    const duplicateEmail = users.find(
      user => user.id !== newRow.id && user.email === newRow.email
    );
    if (duplicateEmail) {
      throw new Error('Email already exists');
    }

    // Prevent duplicate updates
    if (isUpdating) {
      throw new Error('Update in progress');
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
        console.log("User updated");
        
        // Show success notification using Snackbar
        showSuccessNotification(`User "${updatedRowFromDB.username || newRow.username}" has been successfully updated`);
          
        // Reload data while maintaining current search and page state
        await fetchUsers(searchQuery, page);
        
        // Reset updating flag after a short delay
        setTimeout(() => {
          setIsUpdating(false);
        }, 500);
        
        return updatedRowFromDB;
      } else {
        const data = await res.json();
        console.error("Error: " + data.message);
        setIsUpdating(false);
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Request failed:", err);
      setIsUpdating(false);
      throw err;
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
      showAdminWarning();
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
      showAdminWarning();
      return;
    }

    const updatedRows = rows.map((row) => 
      row.id === id ? { ...row, is_frozen: event.target.checked }: row
    );
    toggleFreeze(id)
    setRows(updatedRows);
  };

  useEffect(() => {
    fetchUsers(); // Initial load
  }, []);

  const column = [
    { 
      field: 'username', 
      headerName: 'Username', 
      editable: true,
      width: 200,
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
    }, 
    { 
      field: 'phone_number', 
      headerName: 'Phone', 
      sortable: false, 
      editable: true,
    }, 
    { 
      field: 'address', 
      headerName: 'Address', 
      width: 200, 
      editable: true,
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
  {
    field: 'actions',
    type: 'actions',
    headerName: 'Actions',
    width: 100,
    cellClassName: 'actions',
    getActions: ({ id, row }) => {
      const isInEditMode = rowModesModel[id]?.mode === 'edit';
      const isAdmin = row.is_admin;

      if (isInEditMode) {
        return [
          <GridActionsCellItem
            icon={<SaveIcon />}
            label="Save"
            sx={{
              color: 'primary.main',
            }}
            onClick={handleSaveClick(id)}
          />,
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            className="textPrimary"
            onClick={handleCancelClick(id)}
            color="inherit"
          />,
        ];
      }

      return [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          className="textPrimary"
          onClick={handleEditClick(id)}
          color="inherit"
          disabled={isAdmin} // Disable edit for admin users
          sx={{
            opacity: isAdmin ? 0.5 : 1,
            cursor: isAdmin ? 'not-allowed' : 'pointer'
          }}
        />,
      ];
    },
  },
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
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          columns={column}
          processRowUpdate={handleEditUser}
          getRowId={(row) => row.id} // Changed from username to id for consistency
          onProcessRowUpdateError={handleProcessRowUpdateError}
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

      {/* Unified notification system using Snackbar */}
      <Snackbar 
        open={notificationOpen} 
        autoHideDuration={4000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notificationType}
          variant="filled"
          sx={{
            width: '100%',
            backgroundColor: notificationType === 'success' ? '#4CAF50' : '#FF9800',
            color: '#fff',
            '& .MuiAlert-message': {
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.0178571429em',
            },
            '& .MuiAlert-icon': {
              fontSize: '20px',
            },
            '& .MuiAlert-action': {
              '& .MuiIconButton-root': {
                color: '#fff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                }
              }
            },
            boxShadow: '0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)',
            borderRadius: '12px',
          }}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>

      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
};

export default AdminPage;