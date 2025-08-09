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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Stack,
  InputAdornment,
  FormHelperText,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  PhotoCamera,
  Title,
  Description,
  Close,
} from "@mui/icons-material";
import { IMG_BASE_URL } from "../global-vars.jsx";
import BreadcrumbsNav from "../components/BreadcrumbsNav";
import Header from "../components/Header";

// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

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

  // Handle form submission - including cover image upload
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setError("");
    setSuccess("");

    try {
      // First upload the cover image if there's a new one
      if (coverFile) {
        setUploadingCover(true);
        const formData = new FormData();
        formData.append("image", coverFile);
        formData.append("listingId", id);

        const imgRes = await fetch("/api/listingimg", {
          method: "PUT",
          credentials: "include",
          body: formData,
        });

        const imgData = await imgRes.json();
        if (!imgRes.ok) throw new Error("Image upload failed: " + imgData.message);

        setCoverUrl(imgData.imageUrl);
        setCoverPreview(null);
        setCoverFile(null);
        setUploadingCover(false);
      }

      // Then update the listing details
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
      setUploadingCover(false);
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
      <div className="dashboardCanvas">
        <div className="sidebarSpacer"></div>
        <div className="dashboardContent">
          <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Container>
        </div>
        <div className="sidebarSpacer"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="dashboardCanvas">
        <div className="sidebarSpacer"></div>
        <div className="dashboardContent">
          <Container maxWidth="md" sx={{ mt: 4 }}>
            <Alert severity="error">Listing not found</Alert>
          </Container>
        </div>
        <div className="sidebarSpacer"></div>
      </div>
    );
  }

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        <BreadcrumbsNav />
        {/* page title */}
        <div className="profileTitle">Edit Listing</div>

        <Box
          sx={{
            minHeight: "100vh",
            backgroundColor: "background.default",
            pt: 12,
            pb: 4,
          }}
        >
          <Box maxWidth="800px" mx="auto" px={3}>
            <Header subtitle="Update your auction listing" />

            {/* Alert Messages */}
            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  "& .MuiAlert-message": {
                    fontWeight: 500,
                  },
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  "& .MuiAlert-message": {
                    fontWeight: 500,
                  },
                }}
              >
                {success}
              </Alert>
            )}

            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "surface.main",
              }}
            >
              <CardContent sx={{ p: 4 }}>

                {/* Auction Type Display */}
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="body2">
                    <strong>Auction Type:</strong> {listing.auction_type === "ascending" ? "Ascending Auction" : "Descending Auction"}
                  </Typography>
                </Alert>

                {/* Cover Image Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Cover Image
                  </Typography>
                  
                  {/* Full-width image preview */}
                  <Box
                    sx={{
                      width: "100%",
                      height: 300,
                      border: "1px dashed",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      borderRadius: 2,
                      overflow: "hidden",
                      backgroundColor: "background.paper",
                      mb: 2,
                    }}
                  >
                    {(coverUrl && coverUrl.startsWith(IMG_BASE_URL)) || coverPreview ? (
                      <img
                        src={coverPreview || coverUrl}
                        alt="Cover Image"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          color: "text.secondary",
                        }}
                      >
                        <ImageIcon sx={{ fontSize: 60, mb: 1 }} />
                        <Typography variant="h6">
                          No cover image
                        </Typography>
                        <Typography variant="body2">
                          Choose an image below to add a cover photo
                        </Typography>
                      </Box>
                    )}
                    {coverPreview && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(255,255,255,0.9)",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,1)",
                          },
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  {/* Choose Image Button - Full Width */}
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<PhotoCamera />}
                    fullWidth
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      py: 1.5,
                    }}
                  >
                    {coverFile ? "Change Image" : "Choose Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      hidden
                    />
                  </Button>

                  <FormHelperText sx={{ ml: 0, mt: 1 }}>
                    {coverFile 
                      ? "New image selected. Click 'Update Listing' to save changes."
                      : "Select an image file (max 5MB) to use as the cover image."
                    }
                  </FormHelperText>
                </Box>

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
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {/* Title */}
                        <TextField
                          name="title"
                          label="Listing Name"
                          value={values.title}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.title && Boolean(errors.title)}
                          helperText={
                            (touched.title && errors.title) ||
                            "Give your item a clear, descriptive title"
                          }
                          required
                          fullWidth
                          variant="outlined"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Title color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />

                        {/* Description */}
                        <TextField
                          name="description"
                          label="Description"
                          value={values.description}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.description && Boolean(errors.description)}
                          helperText={
                            (touched.description && errors.description) ||
                            "Provide detailed information about your item"
                          }
                          multiline
                          rows={4}
                          fullWidth
                          variant="outlined"
                          placeholder="Describe the condition, features, and any important details about your item..."
                          InputProps={{
                            startAdornment: (
                              <InputAdornment
                                position="start"
                                sx={{ alignSelf: "flex-start", mt: 1 }}
                              >
                                <Description color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />

                        {/* Action Buttons */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            mt: 4,
                            gap: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            startIcon={<Delete />}
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{
                              borderRadius: 3,
                              px: 4,
                              textTransform: "none",
                              fontWeight: 500,
                            }}
                          >
                            Delete
                          </Button>

                          <Button
                            variant="outlined"
                            size="large"
                            onClick={() => navigate("/dashboard")}
                            sx={{
                              borderRadius: 3,
                              px: 4,
                              textTransform: "none",
                              fontWeight: 500,
                            }}
                          >
                            Cancel
                          </Button>

                          <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isSubmitting || uploadingCover}
                            sx={{
                              borderRadius: 3,
                              px: 4,
                              textTransform: "none",
                              fontWeight: 500,
                              background: "primary",
                              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                            }}
                          >
                            {isSubmitting || uploadingCover ? (
                              <CircularProgress size={24} />
                            ) : (
                              "Update Listing"
                            )}
                          </Button>
                        </Box>
                      </Box>
                    </Form>
                  )}
                </Formik>
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
              aria-labelledby="delete-dialog-title"
              aria-describedby="delete-dialog-description"
              PaperProps={{
                sx: {
                  borderRadius: 3,
                },
              }}
            >
              <DialogTitle id="delete-dialog-title">Delete Listing</DialogTitle>
              <DialogContent>
                <DialogContentText id="delete-dialog-description">
                  Are you sure you want to delete this listing? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={() => setDeleteDialogOpen(false)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleDelete} 
                  color="error" 
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}