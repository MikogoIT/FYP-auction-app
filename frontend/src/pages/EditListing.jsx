import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Stack,
  InputAdornment,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Image as ImageIcon,
  PhotoCamera,
} from "@mui/icons-material";
import { IMG_BASE_URL } from "../global-vars.jsx";

// Simplified validation schema - only title and description
const validationSchema = Yup.object({
  title: Yup.string()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: Yup.string()
    .max(1000, "Description must be less than 1000 characters"),
});

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  // States
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Cover image states
  const [coverUrl, setCoverUrl] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Fetch listing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch listing
        const resList = await fetch(`/api/listings/${id}`);
        const listData = await resList.json();
        if (!resList.ok) throw new Error(listData.message);
        
        console.log("listData:", listData);
        setListing(listData.listing);

        // Fetch existing cover image
        const resImg = await fetch(`/api/listingimg?listingId=${id}`, {
          credentials: "include",
        });
        const imgData = await resImg.json();
        if (resImg.ok && imgData.imageUrl) {
          setCoverUrl(imgData.imageUrl);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Handle form submission - only title and description
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          description: values.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Listing updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Cover image handlers
  const handleCoverChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file must be less than 5MB");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleUploadCover = async () => {
    if (!coverFile) return;

    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("image", coverFile);
      formData.append("listingId", id);

      const res = await fetch("/api/listingimg", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setCoverUrl(data.imageUrl);
      setCoverPreview(null);
      setCoverFile(null);
      setSuccess("Cover image uploaded successfully!");
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploadingCover(false);
    }
  };

  // Handle listing deletion
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess("Listing deleted successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError("Failed to delete listing: " + err.message);
    }
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!listing) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Listing not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ pt: 12, pb: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
          variant="outlined"
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Edit Listing
        </Typography>

        {/* Auction Type Display */}
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
        >
          <Typography variant="body2">
            <strong>Auction Type:</strong> {listing.auction_type === "ascending" ? "Ascending Auction" : "Descending Auction"}
          </Typography>
        </Alert>

        {/* Cover Image Section */}
        <Card sx={{ mb: 4 }}>
          {coverUrl && coverUrl.startsWith(IMG_BASE_URL) ? (
            <CardMedia
              component="img"
              height="300"
              image={coverUrl}
              alt="Cover Image"
              sx={{
                  width: "100%",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0"
              }}
            />
          ) : (
            <Box
              sx={{
                height: 300,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.100",
              }}
            >
              <ImageIcon sx={{ fontSize: 60, color: "grey.400" }} />
            </Box>
          )}

          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCamera />}
                sx={{ flex: 1 }}
              >
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  hidden
                />
              </Button>

              <Button
                variant="contained"
                startIcon={<CloudUpload />}
                onClick={handleUploadCover}
                disabled={!coverFile || uploadingCover}
                sx={{ flex: 1 }}
              >
                {uploadingCover ? "Uploading..." : "Upload"}
              </Button>
            </Stack>

            {coverPreview && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Preview:
                </Typography>
                <img
                  src={coverPreview}
                  alt="Preview"
                  style={{
                    width: 788,
                    height: 300,
                    objectFit: "contain",
                    borderRadius: "4px"
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Form Section - Only Title and Description */}
        <Formik
          initialValues={{
            title: listing.title || "",
            description: listing.description || "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Stack spacing={3}>
                <TextField
                  name="title"
                  label="Title"
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                  required
                  fullWidth
                  variant="outlined"
                />

                <TextField
                  name="description"
                  label="Description"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                />

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ flex: 1 }}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : "Update Listing"}
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<Delete />}
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ flex: 1 }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>

        {/* Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Listing</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this listing? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}