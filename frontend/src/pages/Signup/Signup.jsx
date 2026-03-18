import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./Signup.css";

function Signup({ onLogin = () => {} }) {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // TODO: Connect to backend auth
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        setLoading(false);
        return;
      }

      onLogin(data);
      navigate("/explore");
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-page__left">
        <svg
          className="signup-page__icon"
          viewBox="0 0 48 48"
          fill="none"
          width="64"
          height="64"
        >
          <polygon
            points="24,2 29,18 46,18 32,28 37,45 24,34 11,45 16,28 2,18 19,18"
            fill="#9ABD97"
            opacity=".3"
          />
          <polygon
            points="24,8 27,18 38,18 30,24 33,35 24,28 15,35 18,24 10,18 21,18"
            fill="#9ABD97"
          />
        </svg>
        <h2>Join StudySpot</h2>
        <p>Discover your next study space</p>
      </div>

      <div className="signup-page__right">
        <h3>Create account</h3>
        <form onSubmit={handleSubmit}>
          <div className="signup-page__row">
            <div className="signup-page__field">
              <label htmlFor="signup-first">First name</label>
              <input
                id="signup-first"
                type="text"
                placeholder="First"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="signup-page__field">
              <label htmlFor="signup-last">Last name</label>
              <input
                id="signup-last"
                type="text"
                placeholder="Last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="signup-page__field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              placeholder="you@northeastern.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="signup-page__field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="signup-page__field">
            <label htmlFor="signup-confirm">Confirm password</label>
            <input
              id="signup-confirm"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="signup-page__error">{error}</p>}

          <button
            type="submit"
            className="signup-page__btn"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="signup-page__switch">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}

Signup.propTypes = {
  onLogin: PropTypes.func,
};

export default Signup;