// src/components/TagAutocomplete.jsx

import * as React from "react";
import useAutocomplete from "@mui/material/useAutocomplete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";

// Reuse top-level wrapper styles
const Root = styled("div")(({ theme }) => ({ marginBottom: "1rem" }));
const Label = styled("label")`
  padding: 0 0 4px;
  display: block;
`;
const InputWrapper = styled("div")(({ theme }) => ({
  width: "100%", // Ensure it fills its container
  maxWidth: 400, // ✅ Prevent it from stretching too far
  border: "1px solid #d9d9d9",
  borderRadius: "4px",
  padding: "1px",
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
    minWidth: 60, // ✅ Prevents shrinking too small
  },
}));

const Listbox = styled("ul")(() => ({
  width: "inherit",
  margin: 0,
  padding: 0,
  position: "absolute",
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
  height: "24px",
  margin: "2px",
  padding: "0 4px 0 10px",
  border: "1px solid #e8e8e8",
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
  value: propsValue = [],
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
    options,
    value: propsValue,
    getOptionLabel: (option) => option,
    onChange: (_, selectedOptions) => {
      // NOTE: Do NOT try to deduplicate or inject lockedTag here
      // Just send raw updated list, parent handles logic
      onChange?.(selectedOptions);
    },
  });

  return (
    <Root>
      <div {...getRootProps()}>
        <Label {...getInputLabelProps()}>Tags</Label>
        <InputWrapper ref={setAnchorEl}>
          {propsValue.map((option, index) => {
            const { key, onDelete, ...tagProps } = getTagProps({ index });
            const isLocked = option === lockedTag;

            return (
              <StyledTag key={key}>
                #{option}
                {!isLocked && (
                  <CloseIcon onClick={onDelete} {...tagProps} />
                )}
              </StyledTag>
            );
          })}
          <input
            {...getInputProps({
              onKeyDown: (e) => {
                if ((e.key === "Enter" || e.key === ",") && inputValue.trim()) {
                  e.preventDefault();

                  const newTag = inputValue.trim().toLowerCase();
                  const isDuplicate = propsValue.some(
                    (t) => t.toLowerCase() === newTag
                  );
                  const isLocked = lockedTag?.toLowerCase() === newTag;

                  if (!isDuplicate && !isLocked) {
                    onChange?.([...propsValue, newTag]);
                  }

                  setInputValue("");
                }
              },
            })}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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