// src/components/ListingSearchBar.jsx
import { useState } from 'react';
import { 
  OutlinedInput,
  InputAdornment,
  IconButton,
  styled,
  useTheme,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Form = styled('form')({
  width: '100%',
  display: 'flex',
});

const SearchField = styled(OutlinedInput)(({ theme }) => ({
  flexGrow: 1,
  borderRadius: theme.shape.borderRadius * 2,       // nicer pill shape
  '& fieldset': {
    borderColor: theme.palette.divider,
  },
  '&:hover fieldset': {
    borderColor: theme.palette.text.primary,
  },
  '&.Mui-focused fieldset': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
}));

export default function ListingSearchBar({ onSearch }) {
  const theme = useTheme();
  const [query, setQuery] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <SearchField
        placeholder="Search all listings"
        value={query}
        onChange={e => setQuery(e.target.value)}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              type="submit"
              edge="end"
              sx={{
                padding: theme.spacing(1),
              }}
            >
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </Form>
  );
}
