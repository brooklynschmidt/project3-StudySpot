import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "./Login.css";

function Login({ onLogin = () => {} }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Connect to backend auth
    if (
      email === "yeow.i@northeastern.edu" &&
      password === "studyspot"
    ) {
      onLogin("IY");
      navigate("/explore");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__left">
        <svg
          className="login-page__icon"
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
        <h2>Welcome back</h2>
        <p>Find your favorite spots again</p>
      </div>

      <div className="login-page__right">
        <h3>Log in</h3>
        <form onSubmit={handleSubmit}>
          <div className="login-page__field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="you@northeastern.edu"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          {error && <p className="login-page__error">{error}</p>}

          <button
            type="submit"
            className="login-page__btn login-page__btn--primary"
          >
            Log in
          </button>
        </form>

        <div className="login-page__divider">
          <span>or</span>
        </div>

        <Link
          to="/explore"
          className="login-page__btn login-page__btn--secondary"
        >
          Continue as guest
        </Link>

        <p className="login-page__switch">
          Don&apos;t have an account?{" "}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </main>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func,
};

export default Login;