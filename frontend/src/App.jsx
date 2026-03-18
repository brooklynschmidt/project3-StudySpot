import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import AddSpot from "./pages/AddSpot/AddSpot.jsx";
import Profile from "./pages/Profile/Profile.jsx";

import "./App.css";

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <>
    <Navbar transparent={isHome} loggedIn={true} userInitials="IY" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/add-spot" element={<AddSpot />} />
        <Route path="/profile" element={<Profile />} />
        {/* TODO: Add routes for other pages */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;