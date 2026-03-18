import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./Navbar.css";

function Navbar({ transparent = false, loggedIn = false, userInitials = "" }) {
  return (
    <nav className={`navbar ${transparent ? "navbar--transparent" : ""}`}>
      <Link to="/" className="nav-logo">
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <polygon
            points="10,1 12.5,7 19,7.5 14,12 15.5,19 10,15.5 4.5,19 6,12 1,7.5 7.5,7"
            fill="#9ABD97"
          />
        </svg>
        StudySpot
      </Link>
      <div className="nav-links">
        {loggedIn ? (
          <Link to="/profile" className="nav-avatar" aria-label="Profile">
            {userInitials || (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="16"
                height="16"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </Link>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link nav-link--signup">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  transparent: PropTypes.bool,
  loggedIn: PropTypes.bool,
  userInitials: PropTypes.string,
};

export default Navbar;