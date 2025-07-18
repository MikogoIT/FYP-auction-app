import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { DataGrid, GridActionsCellItem, } from "@mui/x-data-grid";
import { Box, Typography } from "@mui/material";
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Person4OutlinedIcon from '@mui/icons-material/Person4Outlined';
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import Header from "../components/Header";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Switch from "@mui/material/Switch";

const AdminPage = () => {
  const [rows, setRows] = React.useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const navigate = useNavigate(); 

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
        alert(data.message || "Failed to fetch users");
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

  const toggleFreeze = async (userId) => {
    try {
      const res = await fetch(`/api/admin/freeze/${userId}`, {
        method: "PUT",
        credentials: "include", 
      });
      const data = await res.json();
      if (res.ok) {
        alert("Status updated");
        fetchUsers();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      alert("Request failed");
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
      else alert(data.message || "Failed to delete user");
    } catch (err) {
      console.error("Delete user failed:", err);
    }
  };

  const handleDeleteClick = (id) => () => {
    deleteUser(id);
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleSwitch = (id) => (event) => {
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
    { field: 'username', headerName: 'Username' },
    { field: 'email', headerName: 'Email', width: 200 }, 
    { field: 'phone_number', headerName: 'Phone', sortable: false }, 
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
    { field: "access_switch", headerName: "Suspended", display: 'flex', width: 100, sortable: false, filterable: false, type: 'boolean', renderCell: ( params ) => {
        const userId = params.id;


        return(
          <Switch
          checked={false}
          onChange={console.log(`variable: ${params.is_frozen}, data type: ${typeof params.is_frozen}`)}
          />
          
        );
      }
    },
    /*
    { field: 'access_toggle', headerName: 'Suspended', display: "flex", width: 115, sortable: false, renderCell: ( params ) => {
      const frozen = params.is_frozen
      const rowId = params.id

      const [alignment, setAlignment] = React.useState(frozen);

      const handleToggle = (event, newAlignment) => {
        if (newAlignment !== null) {
        toggleFreeze(rowId);
        setAlignment(newAlignment);
        }
      };
        return (
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleToggle}
          >
            <ToggleButton
              value={true}
            >
              <AcUnitOutlinedIcon />
            </ToggleButton>
            <ToggleButton
            value={false}
            >
              <ThumbUpOutlinedIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        );
      }
    },
    */
    {field: "Access", headerName: "Role", display: "flex", width: 115, sortable: false, renderCell: ({ row: {is_admin} }) => {
      return (
        <Box
        width="100%"
        m="0 auto"
        p="5px"
        display="flex"
        justifyContent="center"
        backgroundColor={
          is_admin 
            ? "#6750a4"
            : "#e9def8"
        }
        borderRadius="4px"
        color={
          is_admin
            ? "#ffffff"
            : "#000000"
        }
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
    field: 'id',
    type: 'actions',
    headerName: 'Actions',
    display: "flex",
    cellClassName: 'actions',
    getActions: ({ id }) => {


      return [
        <GridActionsCellItem
          icon={<DeleteOutlineOutlinedIcon />}
          label="Delete"
          onClick={handleDeleteClick(id)}
        />,
      ];
    },
  },

]


  return (
    <Box m="20px">
      <Header title="ADMIN" subtitle="Admin User Management" />
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
          rows={users}
          columns={column}
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
    </Box>
  );
};

export default AdminPage;