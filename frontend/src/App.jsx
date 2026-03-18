import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useCallback } from "react";
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

  /* TODO: Replace with real auth (session/token check) */
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInitials, setUserInitials] = useState("");

  const handleLogin = useCallback((initials) => {
    setLoggedIn(true);
    setUserInitials(initials || "");
  }, []);

  const handleLogout = useCallback(() => {
    setLoggedIn(false);
    setUserInitials("");
  }, []);

  return (
    <>
      <Navbar
        transparent={isHome}
        loggedIn={loggedIn}
        userInitials={userInitials}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={<Login onLogin={handleLogin} />}
        />
        <Route
          path="/signup"
          element={<Signup onLogin={handleLogin} />}
        />
        <Route
          path="/explore"
          element={<Explore loggedIn={loggedIn} />}
        />
        <Route path="/add-spot" element={<AddSpot />} />
        <Route
          path="/profile"
          element={<Profile onLogout={handleLogout} />}
        />
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