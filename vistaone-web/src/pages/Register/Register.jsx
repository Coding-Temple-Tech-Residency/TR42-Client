// registration page - new users request access here
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/Register.css";

function Register() {
  // track all the form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  // tracks whether the form was submitted
  const [submitted, setSubmitted] = useState(false);

  // updates the right field in state when user types
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // runs when user clicks the register button
  const handleSubmit = (e) => {
    e.preventDefault();

    // later this will send the data to the API
    // for now just show a success message
    setSubmitted(true);
  };

  return (
    <div className="register-page">
      {/* left side navy branding panel - same as login */}
      <div className="register-brand">
        <h1 className="register-brand-title">FieldPortal</h1>
        <p className="register-brand-subtitle">Permian Basin Operations</p>
        <p className="register-brand-tagline">
          Request access to manage jobs, track work orders, and handle invoicing.
        </p>
      </div>

      {/* right side - registration form */}
      <div className="register-form-wrapper">
        <div className="register-form-container">
          {/* if form was submitted, show a confirmation message instead */}
          {submitted ? (
            <div className="register-success">
              <h2 className="register-heading">Request submitted</h2>
              <p className="register-success-text">
                Your registration is pending approval. An administrator will
                review your request and you'll receive an email once approved.
              </p>
              <Link to="/" className="register-back-link">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="register-heading">Request access</h2>
              <p className="register-subheading">
                Fill out the form below and an admin will review your request
              </p>

              <form onSubmit={handleSubmit} className="register-form">
                {/* first and last name side by side */}
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">First name</label>
                    <input
                      type="text"
                      name="firstName"
                      className="register-input"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Last name</label>
                    <input
                      type="text"
                      name="lastName"
                      className="register-input"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* email */}
                <label className="register-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="register-input"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                {/* company and role side by side */}
                <div className="register-row">
                  <div className="register-field">
                    <label className="register-label">Company</label>
                    <input
                      type="text"
                      name="company"
                      className="register-input"
                      placeholder="Company name"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="register-field">
                    <label className="register-label">Role</label>
                    <input
                      type="text"
                      name="role"
                      className="register-input"
                      placeholder="e.g. Field Engineer"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* password */}
                <label className="register-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="register-input"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                {/* confirm password */}
                <label className="register-label">Confirm password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="register-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />

                {/* submit button */}
                <button type="submit" className="register-button">
                  Submit request
                </button>
              </form>

              {/* link back to login */}
              <p className="register-login-text">
                Already have an account?{" "}
                <Link to="/" className="register-login-link">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;
