// App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

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
import AdminPage from "./pages/AdminPage";
import CreateCategoryPage from "./pages/CreateCategoryPage";
import ListingCategoryPage from "./pages/listingCategoryPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";

// components
import Header from "./components/Header";                     // no-drawer
import HeaderWithDrawer from "./components/HeaderWithDrawer"; // with drawer
import Footer from "./components/Footer";

const hideDrawerRoutes = ["/", "/login", "/register"];

function AppRoutes({ isApiRoute }) {
  const { pathname } = useLocation();
  const showDrawer = !hideDrawerRoutes.includes(pathname);

  return (
    <>
      {showDrawer
        ? <HeaderWithDrawer window={() => window} />
        : <Header />}

      <div className="mainContent">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sell" element={<SellItem />} />
          <Route path="/edit/:id" element={<EditListing />} />
          <Route path="/bid/:id" element={<BidPage />} />
          <Route path="/mylistings" element={<MyListings />} />
          <Route path="/ListingPage" element={<ListingPage />} />

          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/create-category" element={<CreateCategoryPage />} />
          <Route path="/admin/search-category" element={<ListingCategoryPage />} />
          <Route path="/admin/category/:id" element={<CategoryDetailPage />} />

          {!isApiRoute && (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </div>
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
