import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Signup from "./pages/Signup/Signup.jsx";
import Explore from "./pages/Explore/Explore.jsx";
import AddSpot from "./pages/AddSpot/AddSpot.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import "./App.css";

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/users/me", {
          credentials: "include",
        });

        if (!res.ok) {
          setUser(null);
        } else {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    setUser(null);
  }, []);

  const loggedIn = user !== null;

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar
        transparent={isHome}
        loggedIn={loggedIn}
        userInitials={user ? user.initials : ""}
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
          element={
            <ProtectedRoute user={user}>
              <Explore loggedIn={loggedIn} user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-spot"
          element={
            <ProtectedRoute user={user}>
              <AddSpot user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
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