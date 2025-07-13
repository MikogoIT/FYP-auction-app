// src/components/BreadcrumbsNav.jsx
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, matchPath } from 'react-router-dom';

// map your paths (including param-ized) to human-readable labels
const CRUMB_NAME_MAP = {
  '/dashboard':        'Home',
  '/dashboard':        'Dashboard',
  '/profile':          'Profile',
  '/sell':             'Sell Item',
  '/edit/:id':         'Edit Listing',
  '/bid/:id':          'Place Bid',
  '/mylistings':       'My Listings',
  '/ListingPage':      'All Categories',
  '/listings':         'Search Results',
  '/listings/:category': 'Category',
  '/MyBids':           'My Bids',
  '/Contact':          'Contact Us',
  '/Watchlist':        'Liked Listings',
  // …etc
};

export default function BreadcrumbsNav() {
  const { pathname } = useLocation();
  // split off each segment
  const pathnames = pathname.split('/').filter(Boolean);
  
  // build a crumb for each level
  const crumbs = pathnames.map((_, idx) => {
    const to = '/' + pathnames.slice(0, idx + 1).join('/');
    // find the matching route in our map (supports /edit/:id etc)
    const matchKey = Object.keys(CRUMB_NAME_MAP).find(key =>
      matchPath({ path: key, end: true }, to)
    );
    const label = matchKey
      ? CRUMB_NAME_MAP[matchKey]
      : to; // fallback to the raw segment
    
    return { to, label };
  });

  // always prepend the “Home” crumb
  const allCrumbs = [{ to: '/dashboard', label: 'Home' }, ...crumbs];

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ px: 2, py: 1 }}>
      {allCrumbs.map(({ to, label }, i) => {
        const isLast = i === allCrumbs.length - 1;
        return isLast ? (
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
  );
}
