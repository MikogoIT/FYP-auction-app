// src/components/BreadcrumbsNav.jsx
import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { Link as RouterLink, useLocation, matchPath } from 'react-router-dom';

const CRUMB_NAME_MAP = {
  '/dashboard': 'Home',
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/sell': 'Sell Item',
  '/edit/:id': 'Edit Listing',
  '/bid/:id': 'Place Bid',
  '/mylistings': 'My Listings',
  '/ListingPage': 'All Categories',
  '/listings': 'Search Results',
  '/Watchlist': 'Liked Listings',
  '/MyBids': 'My Bids',
  '/Contact': 'Contact Us',
};

export default function BreadcrumbsNav() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = segments.map((_, i) => {
    const to = '/' + segments.slice(0, i + 1).join('/');
    const matchKey = Object.keys(CRUMB_NAME_MAP).find(key =>
      matchPath({ path: key, end: true }, to)
    );
    return { to, label: matchKey ? CRUMB_NAME_MAP[matchKey] : to };
  });
  const allCrumbs = [{ to: '/dashboard', label: 'Home' }, ...crumbs];

  return (
    <Box
      component="nav"
      aria-label="breadcrumb"
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        px: 2,
        py: 1,
      }}
    >
      <Breadcrumbs>
        {allCrumbs.map(({ to, label }, idx) => {
          const last = idx === allCrumbs.length - 1;
          return last ? (
            <Typography key={to} color="text.primary">
              {label}
            </Typography>
          ) : (
            <Link
              key={to}
              component={RouterLink}
              to={to}
              underline="hover"
              color="inherit"
            >
              {label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
