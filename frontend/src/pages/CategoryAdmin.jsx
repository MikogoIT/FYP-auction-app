// src/pages/Template.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Stack from "@mui/material/Stack";
import { Link } from "react-router";
import Button from "@mui/material/Button"
import { DataGrid, GridActionsCellItem, } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import Switch from "@mui/material/Switch";
import AddCategoryModal from '../components/AddCategoryModal';



// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


export default function CategoryAdmin() {

  // need help to implement functions to:
  // create category
  // edit category
  // suspend category

 

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = useState(1);

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
 
  // edit categories handler
  const handleEditCategories = async (newRow, oldRow) => {
    if (JSON.stringify(newRow) === JSON.stringify(oldRow)) {
      return newRow;
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
        return updatedRowFromDB;
      } else {
        console.error("Error: " + data.message);
        return oldRow;
      }
    } catch (err) {
      console.error("Request failed");
    }
  };

  // create button to add category

  useEffect(() => {
    fetchCategories(); // Initial load
  }, []);

  // datagrid column definitions
  const column = [
   // {field: 'id', headerName: 'ID'},
    {field: 'name', headerName: 'Name', sortable: true, editable: true},
    {field: 'description', headerName: 'Description', sortable: false, editable: true},
    { field: 'is_suspended', headerName: 'Active Status' , display: "flex", sortable: false, width: 150, renderCell: ({ row: {is_suspended} }) => {
      return (
        <Box
        width="100%"
        m="0 auto"
        p="5px"
        display="flex"
        justifyContent="center"
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
    { field: "disable_switch", headerName: "Disabled", display: 'flex', width: 100, sortable: false, filterable: false, renderCell: ({ row: {is_suspended}, row: {id} }) => {
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
          processRowUpdate={handleEditCategories}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
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
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}