// src/components/TelegramFollowButtonSmall.jsx
import { IconButton, useTheme } from '@mui/material';
import TelegramIcon from '@mui/icons-material/Telegram';

const getChannelUrl = (category) => {
  const baseName = category.toLowerCase().replace(/\s+/g, '_');
  const suffix = 'fypauction';
  return `https://t.me/${baseName}_${suffix}`;
};

export default function TelegramFollowButtonSmall({ category }) {
  const theme = useTheme();
  const url = getChannelUrl(category);

  const handleClick = e => {
    e.stopPropagation(); // don’t trigger the card’s onClick
    window.open(url, '_blank');
  };

  return (
    <IconButton
      onClick={handleClick}
      aria-label={`Follow ${category} on Telegram`}
      sx={{
        position: 'absolute',
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        backgroundColor: '#0088cc',
        color: '#fff',
        width: 40,
        height: 40,
        '&:hover': { backgroundColor: '#007ab8' },
        boxShadow: theme.shadows[2],
      }}
    >
      <TelegramIcon sx={{ fontSize: 20 }} />
    </IconButton>
  );
}
