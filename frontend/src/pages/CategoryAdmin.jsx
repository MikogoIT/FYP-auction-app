import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import { Link } from "react-router";
import Button from "@mui/material/Button"
import { DataGrid, GridActionsCellItem, } from "@mui/x-data-grid";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import Switch from "@mui/material/Switch";
import AddCategoryModal from '../components/AddCategoryModal';

// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

export default function CategoryAdmin() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = useState(1);
  
  // State for success notification
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Show success notification
  const showSuccessNotification = (message) => {
    setNotificationMessage(message);
    setNotificationOpen(true);
  };

  // Close notification
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotificationOpen(false);
  };
  


  // Validate name field
  const validateName = (newName, currentId, allCategories) => {
    // Check for empty value
    if (!newName || newName.trim() === '') {
      return {
        isValid: false,
        message: 'Category name cannot be empty'
      };
    }

    // Check for duplicates (case-insensitive)
    const trimmedNewName = newName.trim().toLowerCase();
    const isDuplicate = allCategories.some(category => 
      category.id !== currentId && 
      category.name.toLowerCase() === trimmedNewName
    );

    if (isDuplicate) {
      return {
        isValid: false,
        message: 'A category with this name already exists'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  };

  // calling categories from database
  const fetchCategories = async (query = "", page = 1) => {
    setLoading(true);
    try {
      const endpoint = query
        ? `/api/categories/search?q=${encodeURIComponent(query)}` 
        : `/api/categories/admin`;

      const res = await fetch(endpoint, {
        credentials: "include", 
      });

      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories);
        setPage(page);
      } else {
        console.log(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Fetch/search categories failed:", err);
    }
    setLoading(false);
  };

  // handle clicking on switch to change disabled status
  const toggleSuspend = async (categoryId) => {
    try {
      const res = await fetch(`/api/categories/toggleSuspend/${categoryId}`, {
        method: "PUT",
        credentials: "include", 
      });
      const data = await res.json();
      if (res.ok) {
        console.log("Status updated");
        fetchCategories();
      } else {
        console.log("Error: " + data.message);
      }
    } catch (err) {
      console.log("Request failed");
    }
  };

  const handleSuspend = (id) => (event) => {
    const updatedRows = rows.map((row) => 
      row.id === id ? { ...row, is_suspended: event.target.checked }: row
    );
    toggleSuspend(id)
    setRows(updatedRows);
  };
  
  const handleAddCategory = () => {
    fetchCategories();
  };

  // Edit categories handler with validation
  const handleEditCategories = async (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) {
      return newRow;
    }

    // Validate name field if it was changed
    if (newRow.name !== oldRow.name) {
      const validation = validateName(newRow.name, newRow.id, categories);
      if (!validation.isValid) {
        // Prevent the edit by throwing an error
        throw new Error(validation.message);
      }
    }

    try {
      const res = await fetch(`/api/categories/${newRow.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRow),
      });
      
      if (res.ok) {
        const updatedRowFromDB = await res.json();
        console.log("Category Updated");
        // Show success notification
        showSuccessNotification(`Category "${newRow.name}" has been successfully updated`);
        // Refresh categories to ensure consistency
        await fetchCategories();
        return updatedRowFromDB;
      } else {
        const data = await res.json();
        console.error("Error: " + data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Request failed:", err);
      throw err;
    }
  };



  useEffect(() => {
    fetchCategories(); // Initial load
  }, []);

  // datagrid column definitions
  const column = [
    {
      field: 'name', 
      headerName: 'Name', 
      width: 250, 
      sortable: true, 
      editable: true,
      preProcessEditCellProps: (params) => {
        const validation = validateName(params.props.value, params.id, categories);
        return { ...params.props, error: !validation.isValid };
      },
    },
    {field: 'description', headerName: 'Description', width: 300, sortable: false, editable: true},
    { field: 'is_suspended', headerName: 'Active Status' , display: "flex", sortable: false, width: 200, headerAlign: "left", align: "left",  renderCell: ({ row: {is_suspended} }) => {
      return (
        <Box
        width="100%"
        m="0 auto"
        p="5px"
        display="flex"
        justifyContent="left"
        borderRadius="4px"
        >
          {is_suspended && <AcUnitOutlinedIcon />}
          {!is_suspended && <ThumbUpOutlinedIcon />}
          <Typography sx={{ ml: "5px" }}>
            {
              is_suspended
                ? "Disabled"
                : "Available"
            }
          </Typography>
        </Box>
      );
      }
    }, 
    { field: "disable_switch", headerName: "Disabled", display: 'flex', width: 150, sortable: false, filterable: false, renderCell: ({ row: {is_suspended}, row: {id} }) => {
        const categoryId = id;
        const suspended = is_suspended

        return(
          <Switch
          checked={suspended}
          onChange={handleSuspend(categoryId)}
          />
        );
      }
    },
  ]

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        {/* page title */}
        <div className="profileTitle">Admin Dashboard
          <Stack 
          direction="row" 
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          >
            <Box
            sx={{
              display: "flex",
              gap: 2
            }}
            >
              <Button 
              variant="outlined"
              component={Link}
              to="/admin"
              sx={{
                borderColor: "grey.400",
                color: "grey.500",
                "&:hover": {borderColor: "grey.600"}
              }}
              >
                User Management</Button>
              <Button
              variant="contained"
              component={Link}
              to="/admin/categoryadmin"
              color="primary"
              >
                Category Management</Button>
            </Box>
              <AddCategoryModal onCategoryAdded={handleAddCategory}/>
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
          }}
        >
          <DataGrid 
            rows={categories}
            editMode="row"
            columns={column}
            getRowId={(row) => row.name}
            processRowUpdate={handleEditCategories}
            onProcessRowUpdateError={(error) => {
              console.error('Row update error:', error);
            }}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 8,
                },
              },
            }}
            pageSizeOptions={[5]}
            sx={{
              color: "#000000",
            }}
            width="100%"
            disableRowSelectionOnClick
            loading={loading}
            showToolbar
          />
        </Box>
        
        {/* Material Design 3 success notification */}
        <Snackbar 
          open={notificationOpen} 
          autoHideDuration={4000} 
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity="success"
            variant="filled"
            sx={{
              width: '100%',
              backgroundColor: '#4CAF50',
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
}