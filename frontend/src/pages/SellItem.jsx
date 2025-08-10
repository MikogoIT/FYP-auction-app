import TagAutocomplete from "../components/TagAutocomplete";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  useMediaQuery,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  InputAdornment,
  FormHelperText,
  Alert,
  Paper,
  IconButton,
} from "@mui/material";
import {
  Category,
  Title,
  Description,
  LocalOffer,
  Gavel,
  Schedule,
  AttachMoney,
  TrendingUp,
  TrendingDown,
  Close,
  CloudUpload,
  Image as ImageIcon,
} from "@mui/icons-material";
import { Formik } from "formik";
import Header from "../components/Header"; 
import BreadcrumbsNav from "../components/BreadcrumbsNav";


// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";

const SellItem = () => {
  const [minBid, setMinBid] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("10");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [auctionType, setAuctionType] = useState("");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState();

  // Cover image states
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch((err) => console.error("Failed to load categories:", err));

    fetch("/api/tag")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.tags)) {
          setTagOptions(data.tags);
        }
      })
      .catch((err) => console.error("Failed to load tag options:", err));
  }, []);

  // Resetting Tags with Change of New Category
  useEffect(() => {
    if (categoryName && !tags.includes(categoryName)) {
      setTags([categoryName]);
    }
  }, [categoryName]);

  // Sync debug logs – you can remove in prod
  useEffect(() => {
    console.log("🛠 Auction Type Selected:", auctionType);
    if (auctionType === "ascending") {
      console.log("💰 Minimum Bid:", minBid);
    }
    if (auctionType === "descending") {
      console.log("🔽 Start Price:", startPrice);
      console.log("📉 Discount %:", discountPercentage);
    }
  }, [auctionType, minBid, startPrice, discountPercentage]);

  // Clear inputs on auction type switch
  useEffect(() => {
    if (auctionType === "descending") {
      setMinBid("");
      setStartPrice("");
      setDiscountPercentage("10");
    } else if (auctionType === "ascending") {
      setMinBid("");
      setStartPrice("");
      setDiscountPercentage("10");
    }
  }, [auctionType]);

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find((c) => c.id == selectedId);
    setCategoryId(selectedId);
    setCategoryName(selectedCategory?.name || "");
  };

  const handleDeleteTag = (tagToDelete) => {
    if (tagToDelete === categoryName) return;
    const newTags = tags.filter((tag) => tag !== tagToDelete);
    setTags(newTags);
  };

  // Cover image change handler
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    setError("");
  };

  // Upload cover image for newly created listing
  const uploadCoverForListing = async (listingId) => {
    if (!coverFile) return;
    const formData = new FormData();
    formData.append("image", coverFile);
    formData.append("listingId", listingId);

    const res = await fetch("/api/listingimg", {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Cover image upload failed");
    }
    return data.imageUrl;
  };

  const handleSubmit = async (values, { setFieldError }) => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!values.title || !values.endDateTime) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    if (!values.category) {
      setError("Please select a category");
      setSubmitting(false);
      return;
    }

    if (values.auctionType === "ascending" && !minBid) {
      setError("Please enter a minimum bid.");
      setSubmitting(false);
      return;
    }

    if (
      values.auctionType === "descending" &&
      (!startPrice || !discountPercentage)
    ) {
      setError("Please enter both start price and discount percentage.");
      setSubmitting(false);
      return;
    }

    if (parseFloat(minBid) <= 0 && values.auctionType === "ascending") {
      setError("❌ Minimum bid must be greater than 0.");
      setSubmitting(false);
      return;
    }

    if (new Date(values.endDateTime) < new Date()) {
      setError("❌ End date must be in the future.");
      setSubmitting(false);
      return;
    }

    const tagsArray = tags.length > 0 ? tags : [];

    try {
      // 1. Create the listing
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          auction_type: values.auctionType,
          end_date: new Date(values.endDateTime).toISOString(),
          category_id: values.category,
          ...(values.auctionType === "ascending" && {
            min_bid: parseFloat(minBid),
            start_price: null,
            discount_percentage: 10,
          }),
          ...(values.auctionType === "descending" && {
            min_bid: parseFloat(minBid),
            start_price: startPrice ? parseFloat(startPrice) : null,
            discount_percentage:
              parseFloat(discountPercentage) >= 10
                ? parseFloat(discountPercentage)
                : 10,
          }),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create listing");

      // 2. Insert tags if any
      if (tagsArray.length > 0) {
        const tagRes = await fetch("/api/tag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            auction_id: data.listing.id,
            tags: tagsArray,
          }),
        });
        const tagData = await tagRes.json();
        if (!tagRes.ok)
          throw new Error(tagData.message || "Failed to insert tags");
      }

      // 3. Upload cover image if provided
      let coverMsg = "";
      if (coverFile) {
        try {
          setUploadingCover(true);
          await uploadCoverForListing(data.listing.id);
        } catch (err) {
          coverMsg = ` (cover upload failed: ${err.message})`;
        } finally {
          setUploadingCover(false);
        }
      }

      // 4. Success
      setSuccess("Item listed successfully!" + coverMsg);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Submit error:", err);
      setError("" + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    category: "",
    title: "",
    description: "",
    tags: "",
    auctionType: "",
    endDateTime: "",
  };

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">
        <BreadcrumbsNav />
        {/* page title */}
        <div className="profileTitle">Create Listing</div>

      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "background.default",
          pt: 12,
          pb: 4,
        }}
      >
        <Box maxWidth="800px" mx="auto" px={3}>
          <Header subtitle="Create a new auction listing" />

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

              <Formik onSubmit={handleSubmit} initialValues={initialValues}>
                {({
                  values,
                  errors,
                  touched,
                  handleBlur,
                  handleChange,
                  handleSubmit,
                }) => (
                  <form onSubmit={handleSubmit}>
                    {/* Cover Image Section */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Cover Image (optional)
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
                        {coverPreview ? (
                          <img
                            src={coverPreview}
                            alt="Cover preview"
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
                              No cover image selected
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

                      {/* Choose Cover Button - Full Width */}
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        fullWidth
                        sx={{
                          borderRadius: 3,
                          textTransform: "none",
                          py: 1.5,
                        }}
                      >
                        {coverFile ? "Change Cover Image" : "Upload Cover Image"}
                        <input
                          type="file"
                          accept="image/*"
                          hidden
                          onChange={handleCoverChange}
                        />
                      </Button>

                      <FormHelperText sx={{ ml: 0, mt: 1 }}>
                        {coverFile 
                          ? "New image selected. It will be uploaded when you create the listing."
                          : "Optional. Select an image file (max 5MB) to use as the cover image."
                        }
                      </FormHelperText>
                      
                      {uploadingCover && (
                        <Typography variant="body2" sx={{ mt: 1, color: "primary.main" }}>
                          Uploading cover image...
                        </Typography>
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      {/* Category Dropdown */}
                      <TextField
                        fullWidth
                        variant="outlined"
                        select
                        label="Category"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          handleCategoryChange(e);
                        }}
                        value={values.category}
                        name="category"
                        error={!!touched.category && !!errors.category}
                        helperText={
                          (touched.category && errors.category) ||
                          "Select a category"
                        }
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Category color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </TextField>

                      {/* Title */}
                      <TextField
                        fullWidth
                        variant="outlined"
                        type="text"
                        label="Listing Name"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.title}
                        name="title"
                        error={!!touched.title && !!errors.title}
                        helperText={
                          (touched.title && errors.title) ||
                          "Give your item a clear, descriptive title"
                        }
                        required
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
                        fullWidth
                        variant="outlined"
                        label="Description"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.description}
                        name="description"
                        error={!!touched.description && !!errors.description}
                        helperText={
                          (touched.description && errors.description) ||
                          "Provide detailed information about your item"
                        }
                        multiline
                        rows={4}
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

                      {/* Tags Input Field */}
                      <Box>
                        <TagAutocomplete
                          options={tagOptions || []}
                          value={[]} // hide selected tags in input
                          onChange={(newTags) => {
                            const existingTags = tags.map((t) =>
                              typeof t === "string" ? t.toLowerCase() : t.name.toLowerCase()
                            );
                            const validNewTags = newTags.filter(
                              (tag) => tag && !existingTags.includes(tag.toLowerCase())
                            );
                            if (validNewTags.length > 0) {
                              const updatedTags =
                                categoryName && !tags.includes(categoryName)
                                  ? [categoryName, ...tags.filter((t) => t !== categoryName), ...validNewTags]
                                  : [...tags, ...validNewTags];
                              setTags(updatedTags);
                            }
                            handleChange({
                              target: {
                                name: "tags",
                                value: tags.join(", "),
                              },
                            });
                          }}
                          lockedTag=""
                          placeholder="Type tags and press Enter to add..."
                        />
                        <FormHelperText sx={{ ml: 0, mt: 1 }}>
                          Add tags to help buyers find your item. Press Enter to add
                          tags.
                        </FormHelperText>
                      </Box>

                      {/* Selected Tags */}
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1, fontWeight: 500 }}
                        >
                          Selected Tags
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            backgroundColor: "background.paper",
                            minHeight: 60,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {tags.length > 0 ? (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 1,
                              }}
                            >
                              {tags.map((tag, index) => {
                                const isCategory = tag === categoryName;
                                return (
                                  <Chip
                                    key={index}
                                    label={`#${tag}`}
                                    size="small"
                                    onDelete={
                                      !isCategory
                                        ? () => handleDeleteTag(tag)
                                        : undefined
                                    }
                                    deleteIcon={
                                      !isCategory ? <Close /> : undefined
                                    }
                                    variant={isCategory ? "filled" : "outlined"}
                                    color={isCategory ? "primary" : "default"}
                                    sx={{
                                      borderRadius: 2,
                                      height: 28,
                                      fontSize: "0.8rem",
                                      fontWeight: 500,
                                      backgroundColor: isCategory
                                        ? "primary.main"
                                        : "background.default",
                                      borderColor: isCategory
                                        ? "primary.main"
                                        : "divider",
                                      color: isCategory
                                        ? "primary.contrastText"
                                        : "text.primary",
                                      "& .MuiChip-label": {
                                        px: 1.5,
                                      },
                                      "& .MuiChip-deleteIcon": {
                                        fontSize: "16px",
                                        color: "inherit",
                                        "&:hover": {
                                          color: "error.main",
                                        },
                                      },
                                    }}
                                  />
                                );
                              })}
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: 44,
                                color: "text.secondary",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontStyle: "italic" }}
                              >
                                No tags selected. Category tag will be added
                                automatically.
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                        <FormHelperText sx={{ ml: 0, mt: 1 }}>
                          Category tag (highlighted in blue) is automatically
                          included and cannot be removed.
                        </FormHelperText>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Auction Settings */}
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          color: "text.primary",
                          mb: 2,
                        }}
                      >
                        Auction Settings
                      </Typography>

                      <TextField
                        fullWidth
                        variant="outlined"
                        select
                        label="Auction Type"
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleChange(e);
                          setAuctionType(e.target.value);
                        }}
                        value={values.auctionType}
                        name="auctionType"
                        error={!!touched.auctionType && !!errors.auctionType}
                        helperText={
                          (touched.auctionType && errors.auctionType) ||
                          "Choose how you want to conduct your auction"
                        }
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Gavel color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      >
                        <MenuItem value="ascending">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TrendingUp color="success" />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Ascending Auction
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Bidders compete with increasing bids
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                        <MenuItem value="descending">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TrendingDown color="warning" />
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                Descending Auction
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Price decreases until someone buys
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      </TextField>

                      {values.auctionType === "ascending" && (
                        <TextField
                          fullWidth
                          variant="outlined"
                          type="number"
                          label="Minimum Bid"
                          value={minBid}
                          onChange={(e) => setMinBid(e.target.value)}
                          error={!minBid && values.auctionType === "ascending"}
                          helperText="Set the starting minimum bid amount"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <AttachMoney color="action" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 3,
                            },
                          }}
                        />
                      )}

                      {values.auctionType === "descending" && (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <TextField
                            fullWidth
                            variant="outlined"
                            type="number"
                            label="Starting Price"
                            value={startPrice}
                            onChange={(e) => setStartPrice(e.target.value)}
                            error={
                              !startPrice && values.auctionType === "descending"
                            }
                            helperText="Set the initial price for the descending auction"
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoney color="action" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />

                          <TextField
                            fullWidth
                            variant="outlined"
                            type="number"
                            label="Minimum Bid"
                            value={minBid}
                            onChange={(e) => setMinBid(e.target.value)}
                            error={
                              !minBid && values.auctionType === "descending"
                            }
                            helperText="Set the lowest acceptable bid"
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <AttachMoney color="action" />
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />

                          <TextField
                            fullWidth
                            variant="outlined"
                            type="number"
                            label="Discount Percentage"
                            value={discountPercentage}
                            onChange={(e) =>
                              setDiscountPercentage(e.target.value)
                            }
                            error={!discountPercentage}
                            helperText="How much can buyers bid down at each step?"
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocalOffer color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">%</InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                      )}

                      <TextField
                        fullWidth
                        variant="outlined"
                        type="datetime-local"
                        label="End Date and Time"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.endDateTime}
                        name="endDateTime"
                        error={!!touched.endDateTime && !!errors.endDateTime}
                        helperText={
                          (touched.endDateTime && errors.endDateTime) ||
                          "When should your auction end?"
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Schedule color="action" />
                            </InputAdornment>
                          ),
                        }}
                        required
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

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
                        disabled={submitting}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          textTransform: "none",
                          fontWeight: 500,
                          background: "primary",
                          boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
                        }}
                      >
                        {submitting ? "Creating Listing..." : "Create Listing"}
                      </Button>
                    </Box>
                  </form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </Box>
      </Box>
      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
};

export default SellItem;