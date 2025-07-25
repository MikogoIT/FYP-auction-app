import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddIcon from '@mui/icons-material/Add';

export default function FormDialog( {onCategoryAdded} ) { // onCategoryAdded prop to refresh datagrid once a new category is added
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // create category
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const description = formJson.description;
    const name = formJson.name;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ name: name, description: description }),
      });

      const data = await res.json();
      if (res.ok) {
    console.log(`new category name: ${name}, description: ${description}`);
    handleClose();
    // if callback is provided, call it to nofify datagrid to refresh
        if (onCategoryAdded) {
          onCategoryAdded();
        }
      } else {
        console.error("Category Creation failed");
        handleClose();
      }
    } catch (err) {
      console.error("Create category error:", err);
    } finally {
        handleClose();
    }
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen} color="primary">
        <AddIcon />  Add Category
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create new category</DialogTitle>
        <DialogContent sx={{ paddingBottom: 0 }}>
          <DialogContentText>
            Insert name and description of the new category
          </DialogContentText>
          <form onSubmit={handleSubmit}>
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Category Name"
              type="text"
              fullWidth
              variant="standard"
            />
            <TextField
              autoFocus
              required
              margin="dense"
              id="description"
              name="description"
              label="Category Description"
              type="text"
              multiline
              fullWidth
              variant="standard"
            />
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit">Create New Category</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
}
