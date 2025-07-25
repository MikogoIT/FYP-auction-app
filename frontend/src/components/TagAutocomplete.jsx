// src/components/TagAutocomplete.jsx

import * as React from "react";
import useAutocomplete from "@mui/material/useAutocomplete";
import CloseIcon from "@mui/icons-material/Close";
import { FormHelperText } from "@mui/material";

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
  const [validationMessage, setValidationMessage] = React.useState("");

  

  // Auto-clear validation message after 3s
  /*React.useEffect(() => {
    if (validationMessage) {
      const timeout = setTimeout(() => setValidationMessage(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [validationMessage]); */
  
  React.useEffect(() => {
  if (validationMessage) {
    const timeout = setTimeout(() => setValidationMessage(""), 3000);
    return () => clearTimeout(timeout);
  }
}, [validationMessage]);

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

  // Handles Enter/Comma to manually add tags
  const handleManualAdd = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagsFromInput(inputValue);
    }
  };



  const addTagsFromInput = (rawInput) => {
    console.log("📥 rawInput:", rawInput);
    const rawTags = rawInput.split(",").map((tag) => tag.trim().toLowerCase());

    console.log("🔍 rawTags:", rawTags);

    const invalidTags = rawTags.filter((tag) => !/^[a-z0-9-]+$/i.test(tag));
    console.log("🚫 invalidTags:", invalidTags);

    if (invalidTags.length > 0) {
      setValidationMessage(`❌ Invalid tag(s): ${invalidTags.join(", ")}`);
      setInputValue("");
      return;
    }


    const existing = value.map((t) => t.toLowerCase());
    const locked = lockedTag?.toLowerCase?.();

    const duplicateTags = rawTags.filter(
      (tag) => existing.includes(tag) || tag === locked,
    );
    console.log("⚠️ duplicateTags:", duplicateTags);
    
    if (duplicateTags.length > 0) {
      setValidationMessage(`⚠️ Duplicate tag(s): ${duplicateTags.join(", ")}`);
      setInputValue("");
      return;
    }

    const validTags = rawTags.filter((tag) => tag.length > 0);

    const finalTags = lockedTag
      ? [lockedTag, ...value.filter((t) => t !== lockedTag), ...validTags]
      : [...value, ...validTags];

    onChange?.(finalTags);
    setInputValue("");
    setValidationMessage(""); // Clear on success
  };

  // Handles Blur Add on Mobile to manually add tags (new code)
  const handleBlurAdd = () => {
    if (!inputValue.trim()) return;

    addTagsFromInput(inputValue); // Re-use your main handler
  };

  console.log("📣 validationMessage:", validationMessage);

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
              onKeyDown: handleManualAdd, // handles Enter on desktop
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
          />
        </InputWrapper>
      </div>
      {/* Validation Message for Duplicate Tag or Invalid With Symbols*/}
      <div style={{ background: "#ffeeee", padding: "8px", color: "red" }}>
        {validationMessage || "debug: no message"}
      </div>

      {groupedOptions.length > 0 && (
        <Listbox {...getListboxProps()}>
          {groupedOptions.map((option, index) => (
            <li {...getOptionProps({ option, index })} key={index}>
              <span>{option}</span>
            </li>
          ))}
        </Listbox>
      )}
    </Root>
  );
}
