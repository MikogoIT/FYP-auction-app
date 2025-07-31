import * as React from "react";
import {
  Box,
  TextField,
  Chip,
  InputAdornment,
  FormHelperText,
  Paper,
  MenuList,
  MenuItem,
  Typography,
  useTheme
} from "@mui/material";
import { LocalOffer, Add } from "@mui/icons-material";
import useAutocomplete from "@mui/material/useAutocomplete";

export default function TagAutocomplete({
  options = [],
  value = [],
  onChange,
  lockedTag = "",
  label = "Tags",
  placeholder = "Add tags...",
  helperText = "Press Enter to add tags",
  error = false,
  ...props
}) {
  const [inputValue, setInputValue] = React.useState("");
  const theme = useTheme();

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl,
    focused,
  } = useAutocomplete({
    id: "tag-autocomplete",
    multiple: true,
    freeSolo: true,
    options,
    inputValue,
    onInputChange: (_, newInput) => setInputValue(newInput),
    value,
    onChange: (_, selectedOptions) => {
      const normalize = (s) => s.toLowerCase();
      const filtered = selectedOptions
        .map((tag) => tag.trim())
        .filter(
          (tag, i, arr) =>
            /^[a-z0-9-]+$/i.test(tag) &&
            arr.findIndex((t) => normalize(t) === normalize(tag)) === i &&
            (!lockedTag || normalize(tag) !== normalize(lockedTag)),
        );
      const newList = lockedTag ? [lockedTag, ...filtered] : filtered;
      onChange?.(newList);
    },
  });

  const handleManualAdd = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagsFromInput(inputValue);
    }
  };

  const addTagsFromInput = (rawInput) => {
    console.log("📥 rawInput:", rawInput);
    const rawTags = rawInput.split(",").map((tag) => tag.trim().toLowerCase());

    const invalidTags = rawTags.filter((tag) => !/^[a-z0-9-]+$/i.test(tag));
    if (invalidTags.length > 0) {
      setInputValue("");
      return;
    }

    const existing = value.map((t) => t.toLowerCase());
    const locked = lockedTag?.toLowerCase?.();

    const duplicateTags = rawTags.filter(
      (tag) => existing.includes(tag) || tag === locked,
    );
    if (duplicateTags.length > 0) {
      setInputValue("");
      return;
    }

    const validTags = rawTags.filter((tag) => tag.length > 0);

    const finalTags = lockedTag
      ? [lockedTag, ...value.filter((t) => t !== lockedTag), ...validTags]
      : [...value, ...validTags];

    onChange?.(finalTags);
    setInputValue("");
  };

  const handleBlurAdd = () => {
    if (!inputValue.trim()) return;
    addTagsFromInput(inputValue);
  };

  const handleDeleteTag = (tagToDelete) => {
    if (tagToDelete === lockedTag) return; // Don't allow deleting locked tag
    const newTags = value.filter(tag => tag !== tagToDelete);
    onChange?.(newTags);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <div {...getRootProps()}>
        <TextField
          {...getInputProps({
            placeholder: value.length === 0 ? placeholder : "",
            onKeyDown: handleManualAdd,
            onChange: (e) => {
              const newInput = e.target.value;
              if (newInput.includes(",")) {
                addTagsFromInput(newInput);
              } else {
                setInputValue(newInput);
              }
            },
            onBlur: handleBlurAdd,
          })}
          fullWidth
          variant="outlined"
          label={label}
          error={error}
          InputProps={{
            ref: setAnchorEl,
            startAdornment: (
              <InputAdornment position="start">
                <LocalOffer color="action" />
              </InputAdornment>
            ),
            endAdornment: inputValue ? (
              <InputAdornment position="end">
                <Add 
                  color="primary" 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.dark' }
                  }}
                  onClick={() => addTagsFromInput(inputValue)}
                />
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              minHeight: value.length > 0 ? 'auto' : '56px',
              alignItems: 'flex-start',
              paddingTop: value.length > 0 ? '14px' : '16.5px',
              paddingBottom: value.length > 0 ? '14px' : '16.5px',
            },
          }}
          {...props}
        />

        {/* Tags Display - Single unified approach */}
        {value.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '14px',
              left: '54px', // Account for start adornment
              right: inputValue ? '54px' : '14px', // Account for end adornment if present
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              zIndex: 1,
              pointerEvents: 'auto',
            }}
          >
            {value.map((tag, index) => {
              const isLocked = tag === lockedTag;
              return (
                <Chip
                  key={index}
                  label={`#${tag}`}
                  size="small"
                  onDelete={!isLocked ? () => handleDeleteTag(tag) : undefined}
                  variant={isLocked ? "filled" : "outlined"}
                  color={isLocked ? "primary" : "default"}
                  sx={{
                    borderRadius: 2,
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: isLocked ? 'primary.main' : 'background.paper',
                    borderColor: isLocked ? 'primary.main' : 'divider',
                    '& .MuiChip-label': {
                      px: 1,
                    },
                    '& .MuiChip-deleteIcon': {
                      fontSize: '16px',
                      '&:hover': {
                        color: 'error.main',
                      },
                    },
                  }}
                />
              );
            })}
          </Box>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {groupedOptions.length > 0 && (
        <Paper
          {...getListboxProps()}
          elevation={0}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1300,
            mt: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            maxHeight: 200,
            overflow: 'auto',
            backgroundColor: 'background.paper',
          }}
        >
          <MenuList dense>
            {groupedOptions.map((option, index) => (
              <MenuItem
                {...getOptionProps({ option, index })}
                key={index}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'action.selected',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalOffer fontSize="small" color="action" />
                  <Typography variant="body2">#{option}</Typography>
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        </Paper>
      )}

      {/* Helper Text */}
      {helperText && (
        <FormHelperText 
          error={error}
          sx={{ 
            ml: 0, 
            mt: 1,
            fontSize: '0.75rem'
          }}
        >
          {helperText}
        </FormHelperText>
      )}
    </Box>
  );
}