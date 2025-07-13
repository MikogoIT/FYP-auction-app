// src/components/ListingSearchBar.jsx
import { useState } from 'react';
import { 
  OutlinedInput,
  InputAdornment,
  IconButton,
  styled,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Form = styled('form')({
  width: '100%',
  display: 'flex',
});

const SearchField = styled(OutlinedInput)(({ theme }) => ({
  flexGrow: 1,
  borderRadius: 24,       // pill shape
  // set the font-size on the actual <input>
  '& .MuiOutlinedInput-input': {
    fontSize: '16px',
    padding: theme.spacing(1.5, 2),   // tweak vertical/horizontal padding
  },
  // Optional: ensure the placeholder also uses 16px
  '& .MuiOutlinedInput-input::placeholder': {
    fontSize: '16px',
    opacity: 1,
  },
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
        // (you could also use inputProps, but styling above covers it)
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              type="submit"
              edge="end"
              sx={{ p: theme.spacing(1) }}
            >
              {/* force the icon to 16px too */}
              <SearchIcon sx={{ fontSize: '16px' }} />
            </IconButton>
          </InputAdornment>
        }
      />
    </Form>
  );
}
