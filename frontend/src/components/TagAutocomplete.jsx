// src/components/TagAutocomplete.jsx

import * as React from "react";
import useAutocomplete from "@mui/material/useAutocomplete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";

// COMPONENT STYLING
const Root = styled("div")(({ theme }) => ({ marginBottom: "1rem" }));
const Label = styled("label")`
  padding: 0 0 4px;
  display: block;
`;
const InputWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  maxWidth: 400,
  border: "1px solid #d9d9d9",
  borderRadius: "4px",
  padding: "8px",
  marginBottom: "12px",
  display: "flex",
  flexWrap: "wrap",
  backgroundColor: "#fff",
  "&.focused": {
    borderColor: "#40a9ff",
    boxShadow: "0 0 0 2px rgb(24 144 255 / 0.2)",
  },
  "& input": {
    border: 0,
    height: 30,
    outline: 0,
    padding: "4px 6px",
    flexGrow: 1,
    minWidth: 60,
  },
}));

const Listbox = styled("ul")(() => ({
  width: "inherit",
  margin: 0,
  padding: 0,
  listStyle: "none",
  backgroundColor: "#fff",
  overflow: "auto",
  maxHeight: "250px",
  borderRadius: "4px",
  boxShadow: "0 2px 8px rgb(0 0 0 / 0.15)",
  zIndex: 1,
}));

const StyledTag = styled("div")(() => ({
  display: "flex",
  alignItems: "center",
  height: 24,
  margin: "2px",
  padding: "0 4px 0 10px",
  border: `1px solid #e8e8e8`,
  borderRadius: "2px",
  backgroundColor: "#fafafa",
  "& svg": {
    fontSize: "14px",
    cursor: "pointer",
    padding: "4px",
  },
}));

export default function TagAutocomplete({
  options = [],
  value = [],
  onChange,
  lockedTag = "",
}) {
  const [inputValue, setInputValue] = React.useState("");

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    setAnchorEl,
  } = useAutocomplete({
    id: "tag-autocomplete",
    multiple: true,
    freeSolo: true, // 💡 Let users add their own tags!!
    options,
    inputValue,
    onInputChange: (_, newInput) => setInputValue(newInput),
    value,
    onChange: (_, selectedOptions) => {
      // Ensure lockedTag is always first and not duplicated
      const normalize = (s) => s.toLowerCase();
      const filtered = selectedOptions.filter(
        (tag, i, arr) =>
          arr.findIndex((t) => normalize(t) === normalize(tag)) === i &&
          (!lockedTag || normalize(tag) !== normalize(lockedTag)),
      );
      const newList = lockedTag ? [lockedTag, ...filtered] : filtered;
      onChange?.(newList);
    },
  });

  // Handles Enter/Comma to manually add tags
  const handleManualAdd = (e) => {
    const k = e.key?.toLowerCase(); // Lowercase for onKey

    if (k === "enter" || k === ",") {
      e.preventDefault();

      let newTag = inputValue.trim().replace(/,+$/, "").toLowerCase();

      const isDuplicate = value.some((t) => t.toLowerCase() === newTag);
      const isLocked = lockedTag?.toLowerCase() === newTag;

      if (newTag && !isDuplicate && !isLocked) {
        const newTags = [...value, newTag];
        onChange?.(newTags);
      }

      setInputValue("");
    }
  };

  // Handles Blur Add on Mobile to manually add tags
  const handleBlurAdd = () => {
    let newTag = inputValue.trim().replace(/,+$/, "").toLowerCase();

    const isDuplicate = value.some((t) => t.toLowerCase() === newTag);
    const isLocked = lockedTag?.toLowerCase() === newTag;

    if (newTag && !isDuplicate && !isLocked) {
      const newTags = [...value, newTag];
      onChange?.(newTags);
    }

    setInputValue("");
  };

  return (
    <Root>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>Tags</Label>
        <InputWrapper ref={setAnchorEl}>
          {value.map((option, index) => {
            const { key, onDelete, ...tagProps } = getTagProps({ index });
            const isLocked = option === lockedTag;

            return (
              <StyledTag key={key}>
                #{option}
                {!isLocked && <CloseIcon onClick={onDelete} {...tagProps} />}
              </StyledTag>
            );
          })}

          <input
            {...getInputProps({
              placeholder: "Add a tag",
              onKeyDown: handleManualAdd, // handles Enter/Comma on desktop
              onBlur: handleBlurAdd, // handles "Done" on mobile keyboard
            })}
          />
        </InputWrapper>
      </div>

      {groupedOptions.length > 0 && (
        <Listbox {...getListboxProps()}>
          {groupedOptions.map((option, index) => (
            <li {...getOptionProps({ option, index })} key={index}>
              <span>{option}</span>
              <CheckIcon fontSize="small" />
            </li>
          ))}
        </Listbox>
      )}
    </Root>
  );
}
