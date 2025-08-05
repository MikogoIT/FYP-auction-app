// App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

// pages
import Landing from "./pages/landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SellItem from "./pages/SellItem";
import EditListing from "./pages/EditListing";
import BidPage from "./pages/BidPage";
import MyListings from "./pages/MyListings";
import ListingPage from "./pages/ListingPage";
import ListingsResultPage from "./pages/ListingsResultPage";
import AdminPage from "./pages/AdminPage";
import CreateCategoryPage from "./pages/CreateCategoryPage";
import ListingCategoryPage from "./pages/listingCategoryPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import MyBids from "./pages/MyBids";
import ContactPage from "./pages/ContactPage";
import WatchedListings from "./pages/WatchedListings";
import FeedbackForm from "./components/FeedbackForm";
import FeedbackList from "./pages/FeedbackList";
import UserFeedback from "./pages/UserFeedbackPage";
import Notif from "./pages/Notif";
import ProfileFeedbackPage from "./pages/ProfileFeedbackPage";
import CategoryAdmin from "./pages/CategoryAdmin";
import MyListingsBids from "./pages/MyListingsBids";

// components
import Header from "./components/Header"; // no-drawer
import HeaderWithDrawer from "./components/HeaderWithDrawer"; // with drawer
import Footer from "./components/Footer";

const hideDrawerRoutes = [
  "/",
  "/login",
  "/register",
  "/feedback-list",
  "/admin",
  "/admin/categoryadmin",
];

// root redirect component
function RootRedirect() {
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/profile", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error("not authenticated");
        const data = await res.json();
        if (cancelled) return;
        setLoggedIn(!!data.user);
      })
      .catch(() => {
        if (cancelled) return;
        setLoggedIn(false);
      })
      .finally(() => {
        if (cancelled) return;
        setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  if (!checked) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  return loggedIn ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function AppRoutes({ isApiRoute }) {
  const { pathname } = useLocation();
  const showDrawer = !hideDrawerRoutes.includes(pathname);

  return (
    <>
      {showDrawer ? (
        <HeaderWithDrawer window={() => window} />
      ) : (
        <Header />
      )}

      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/sell" element={<SellItem />} />
        <Route path="/edit/:id" element={<EditListing />} />
        <Route path="/bid/:id" element={<BidPage />} />
        <Route path="/mylistings" element={<MyListings />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/admin/categoryadmin"
          element={<CategoryAdmin />}
        />
        <Route
          path="/admin/create-category"
          element={<CreateCategoryPage />}
        />
        <Route
          path="/admin/search-category"
          element={<ListingCategoryPage />}
        />
        <Route
          path="/admin/category/:id"
          element={<CategoryDetailPage />}
        />
        <Route path="/ListingPage" element={<ListingPage />} />
        <Route path="/listings" element={<ListingsResultPage />} />
        <Route path="/MyBids" element={<MyBids />} />
        <Route path="/Contact" element={<ContactPage />} />
        <Route
          path="/Watchlist"
          element={<WatchedListings />}
        />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route
          path="/feedback-list"
          element={<FeedbackList />}
        />
        <Route
          path="/feedback-user/:auctionId"
          element={<UserFeedback />}
        />
        <Route path="/notif" element={<Notif />} />
        <Route
          path="/feedback/:userId"
          element={<ProfileFeedbackPage />}
        />
        <Route
          path="/mylistings/MyListingsBids"
          element={<MyListingsBids />}
        />

        {!isApiRoute && (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
      </Routes>
    </>
  );
}

export default function App() {
  // detect API routes so we don’t redirect those
  const isApiRoute = window.location.pathname.startsWith("/api");

  return (
    <div className="appContainer">
      <Router>
        <AppRoutes isApiRoute={isApiRoute} />
        <Footer />
      </Router>
    </div>
  );
}
