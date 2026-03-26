// login page - first thing users see when they open the app
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/Login.css";

function Login() {
  // state to track what the user types into the form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // useNavigate lets us redirect the user to another page
  const navigate = useNavigate();

  // runs when the user clicks the login button
  const handleSubmit = (e) => {
    // prevent the page from refreshing on form submit
    e.preventDefault();

    // save a token so the app knows we're logged in
    // later this will come from the real backend API
    localStorage.setItem("token", "demo-token");

    // send user to the dashboard
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      {/* left side - the navy branding panel */}
      <div className="login-brand">
        <h1 className="login-brand-title">FieldPortal</h1>
        <p className="login-brand-subtitle">Permian Basin Operations</p>
        <p className="login-brand-tagline">
          Manage jobs, work orders, and invoices in one place.
        </p>
      </div>

      {/* right side - the login form */}
      <div className="login-form-wrapper">
        <div className="login-form-container">
          <h2 className="login-heading">Welcome back</h2>
          <p className="login-subheading">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* email input */}
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* password input */}
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {/* forgot password link */}
            <div className="login-options">
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>

            {/* submit button */}
            <button type="submit" className="login-button">
              Sign in
            </button>
          </form>

          {/* link to registration page */}
          <p className="login-register-text">
            Don't have an account?{" "}
            <Link to="/register" className="login-register-link">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
