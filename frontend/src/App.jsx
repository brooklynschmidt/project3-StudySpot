import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home/Home.jsx";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar transparent />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* TODO: Add routes for other pages */}
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* <Route path="/explore" element={<Explore />} /> */}
        {/* <Route path="/spots/:id" element={<SpotDetail />} /> */}
        {/* <Route path="/add-spot" element={<AddSpot />} /> */}
        {/* <Route path="/favorites" element={<Favorites />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;