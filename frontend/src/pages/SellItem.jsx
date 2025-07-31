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
  Paper
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
  Close
} from "@mui/icons-material";
import { Formik } from "formik";
import Header from "../components/Header"; // Assuming Header component exists

const SellItem = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minBid, setMinBid] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [auctionType, setAuctionType] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("10");

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagOptions, setTagOptions] = useState();
  const tagNames = tags.map((tag) =>
    typeof tag === "string" ? tag : tag.name,
  );

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
          setTagOptions(data.tags); // ✅ Flat string array
        }
      })
      .catch((err) => console.error("Failed to load tag options:", err));
  }, []);

  // Resetting Tags with Change of New Category
  useEffect(() => {
    if (categoryName && !tags.includes(categoryName)) {
      setTags([categoryName]);
      //console.log("Category changed →", categoryName);
    }
  }, [categoryName]);

  // Console Log Tag (Debug)
  useEffect(() => {
    if (tags.length) {
      //console.log("🔁 Tags Updated →", tags);
    }
  }, [tags]);

  // Console Log Auction Type(Debug)
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

  // Clear Inputs on switching Auction Type
  useEffect(() => {
    if (auctionType === "descending") {
      setMinBid(""); // clear min bid if needed
      setStartPrice(""); // clear start price to be safe
      setDiscountPercentage(10); // default 10%
    } else if (auctionType === "ascending") {
      setMinBid(""); // clear min bid if needed
      setStartPrice(null); // clear start price to be safe
      setDiscountPercentage(null); // default 10%
    }
  }, [auctionType]);

  // Category Change
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const selectedCategory = categories.find((c) => c.id == selectedId);
    setCategoryId(selectedId);
    setCategoryName(selectedCategory?.name || "");
  };

  // Handle tag deletion
  const handleDeleteTag = (tagToDelete) => {
    if (tagToDelete === categoryName) return; // Don't allow deleting category tag
    const newTags = tags.filter(tag => tag !== tagToDelete);
    setTags(newTags);
  };

  const handleSubmit = async (values, { setFieldError }) => {
    if (submitting) return; // Prevent further execution if already submitting
    setSubmitting(true); // Sets to true right away
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

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

    if (values.auctionType === "descending" && (!startPrice || !discountPercentage)) {
      setError("Please enter both start price and discount percentage.");
      setSubmitting(false);
      return;
    }

    if (parseFloat(minBid) <= 0) {
      setError("❌ Minimum bid must be greater than 0.");
      setSubmitting(false);
      return;
    }

    if (new Date(values.endDateTime) < new Date()) {
      setError("❌ End date must be in the future.");
      setSubmitting(false);
      return;
    }

    // Parse tags from text input
    const tagsArray = tags.length > 0 ? tags : [];

    // Debug Log for Tags Submission
    //console.log("Tags being inserted:", tagsArray);

    try {
      // 1. Create the listing first
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
          end_date: new Date(values.endDateTime).toISOString(), // convert back to UTC for database
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

      // 2. Now insert tags via /api/tag
      if (tagsArray.length > 0) {
        const tagRes = await fetch("/api/tag", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            auction_id: data.listing.id, // ✅ use ID from first request
            tags: tagsArray,
          }),
        });

        const tagData = await tagRes.json();
        if (!tagRes.ok)
          throw new Error(tagData.message || "Failed to insert tags");
      }

      // 3. Success
      setSuccess("Item listed successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error("Submit error:", err);
      setError("" + err.message);
    } finally {
      setSubmitting(false); // Allow future submissions if the user stays
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
    <Box 
      sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        pt: 12,
        pb: 4
      }}
    >
      <Box maxWidth="800px" mx="auto" px={3}>
        <Header title="CREATE LISTING" subtitle="Create a new auction listing" />

        {/* Alert Messages */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontWeight: 500
              }
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
              '& .MuiAlert-message': {
                fontWeight: 500
              }
            }}
          >
            {success}
          </Alert>
        )}

        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'surface.main'
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 3
              }}
            >
              Create Listing
            </Typography>

            <Formik
              onSubmit={handleSubmit}
              initialValues={initialValues}
            >
              {({
                values,
                errors,
                touched,
                handleBlur,
                handleChange,
                handleSubmit,
              }) => (
                <form onSubmit={handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    
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
                      helperText={touched.category && errors.category}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
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
                      helperText={touched.title && errors.title || "Give your item a clear, descriptive title"}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Title color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
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
                      helperText={touched.description && errors.description || "Provide detailed information about your item"}
                      multiline
                      rows={4}
                      placeholder="Describe the condition, features, and any important details about your item..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                            <Description color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    />

                    {/* Tags Input Field - Modified to not show selected tags */}
                    <Box>
                      <TagAutocomplete
                        options={tagOptions || []}
                        value={[]} // Always empty to hide selected tags in input
                        onChange={(newTags) => {
                          // Handle adding new tags to the main tags state
                          const existingTags = tags.map(t => t.toLowerCase());
                          const validNewTags = newTags.filter(tag => 
                            tag && !existingTags.includes(tag.toLowerCase())
                          );
                          
                          if (validNewTags.length > 0) {
                            const updatedTags = categoryName && !tags.includes(categoryName)
                              ? [categoryName, ...tags.filter(t => t !== categoryName), ...validNewTags]
                              : [...tags, ...validNewTags];
                            setTags(updatedTags);
                          }
                          
                          // Update Formik's values.tags for validation/submission
                          handleChange({
                            target: {
                              name: 'tags',
                              value: tags.join(', ')
                            }
                          });
                        }}
                        lockedTag="" // No locked tag in input field
                        placeholder="Type tags and press Enter to add..."
                      />
                      <FormHelperText sx={{ ml: 0, mt: 1 }}>
                        Add tags to help buyers find your item. Press Enter or comma to add tags. No duplicate tags or special symbols allowed.
                      </FormHelperText>
                    </Box>

                    {/* Selected Tags Display Area */}
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
                          backgroundColor: 'background.paper',
                          minHeight: 60,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        {tags.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {tags.map((tag, index) => {
                              const isCategory = tag === categoryName;
                              return (
                                <Chip
                                  key={index}
                                  label={`#${tag}`}
                                  size="small"
                                  onDelete={!isCategory ? () => handleDeleteTag(tag) : undefined}
                                  deleteIcon={!isCategory ? <Close /> : undefined}
                                  variant={isCategory ? "filled" : "outlined"}
                                  color={isCategory ? "primary" : "default"}
                                  sx={{
                                    borderRadius: 2,
                                    height: 28,
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    backgroundColor: isCategory ? 'primary.main' : 'background.default',
                                    borderColor: isCategory ? 'primary.main' : 'divider',
                                    color: isCategory ? 'primary.contrastText' : 'text.primary',
                                    '& .MuiChip-label': {
                                      px: 1.5,
                                    },
                                    '& .MuiChip-deleteIcon': {
                                      fontSize: '16px',
                                      color: 'inherit',
                                      '&:hover': {
                                        color: 'error.main',
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
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: 44,
                              color: 'text.secondary',
                            }}
                          >
                            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                              No tags selected. Category tag will be added automatically.
                            </Typography>
                          </Box>
                        )}
                      </Paper>
                      <FormHelperText sx={{ ml: 0, mt: 1 }}>
                        Category tag (highlighted in blue) is automatically included and cannot be removed.
                      </FormHelperText>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Auction Section */}
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2
                      }}
                    >
                      Auction Settings
                    </Typography>

                    {/* Auction Type Dropdown */}
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
                      helperText={touched.auctionType && errors.auctionType || "Choose how you want to conduct your auction"}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Gavel color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    >
                      <MenuItem value="ascending">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp color="success" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Ascending Auction
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Bidders compete with increasing bids
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                      <MenuItem value="descending">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingDown color="warning" />
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Descending Auction
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Price decreases until someone buys
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    </TextField>

                    {/* Auction-specific fields */}
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
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                          }
                        }}
                      />
                    )}

                    {values.auctionType === "descending" && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          variant="outlined"
                          type="number"
                          label="Starting Price"
                          value={startPrice}
                          onChange={(e) => setStartPrice(e.target.value)}
                          error={!startPrice && values.auctionType === "descending"}
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
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                            }
                          }}
                        />
                        
                        <TextField
                          fullWidth
                          variant="outlined"
                          type="number"
                          label="Minimum Bid"
                          value={minBid}
                          onChange={(e) => setMinBid(e.target.value)}
                          error={!minBid && values.auctionType === "descending"}
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
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                            }
                          }}
                        />
                        
                        <TextField
                          fullWidth
                          variant="outlined"
                          type="number"
                          label="Discount Percentage"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(e.target.value)}
                          error={!discountPercentage}
                          helperText="How much can buyers bid down at each step?"
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalOffer color="action" />
                              </InputAdornment>
                            ),
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                            }
                          }}
                        />
                      </Box>
                    )}

                    {/* End Date and Time */}
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
                      helperText={touched.endDateTime && errors.endDateTime || "When should your auction end?"}
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
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                        }
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                    <Button 
                      variant="outlined"
                      size="large"
                      onClick={() => navigate("/dashboard")}
                      sx={{ 
                        borderRadius: 3,
                        px: 4,
                        textTransform: 'none',
                        fontWeight: 500
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
                        textTransform: 'none',
                        fontWeight: 500,
                        background: 'primary',
                        boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
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
  );
};

export default SellItem;