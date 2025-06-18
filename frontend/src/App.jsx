import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SellItem from "./pages/SellItem";
import EditListing from "./pages/EditListing";
import BidPage from "./pages/BidPage";
import MyListings from "./pages/MyListings";
import ImageUploadPage from "./pages/upl";
import AdminPage from "./pages/AdminPage";
import CreateCategoryPage from "./pages/CreateCategoryPage";
import ListingCategoryPage from "./pages/listingCategoryPage";


// components
import Header from "./components/Header";
import Footer from "./components/Footer";


function App() {
  const isApiRoute = window.location.pathname.startsWith("/api");



  return (
    <div className="appContainer">
      <Router>
        <Header />
        <div className="mainContent">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sell" element={<SellItem />} />
            <Route path="/edit/:id" element={<EditListing />} />
            <Route path="/bid/:id" element={<BidPage />} />
            <Route path="/mylistings" element={<MyListings />} />
            <Route path="/uploadImgTest" element={<ImageUploadPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/create-category" element={<CreateCategoryPage />} />
            <Route path="/search-category" element={<ListingCategoryPage />} />
            {!isApiRoute && (
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
}


export default App;
