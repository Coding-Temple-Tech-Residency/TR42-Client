import React, { useState } from "react";
import { companies } from "../data/companies";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/register-user.css";
import "../styles/login.css";
import {
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  User,
  Calendar,
  MapPin,
  Phone,
  Image as ImageIcon,
  IdCard,
} from "lucide-react";

const initialState = {
  username: "",
  password: "",
  confirmPassword: "",
  email: "",
  profilePhoto: null,
  firstName: "",
  lastName: "",
  middleName: "",
  contactNumber: "",
  alternateNumber: "",
  dob: "",
  ssnLastFour: "",
  addressLine1: "",
  city: "",
  state: "",
  zip: "",
  country: "",
  companyId: "",
};

function RegisterUser() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate only step 1 fields
  function validateStep1() {
    const newErrors = {};

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!formData.companyId) newErrors.companyId = "Company is required";

    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email";

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      newErrors.password =
        "Password must be at least 8 characters and include uppercase, lowercase, and a number";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  };

  const selectedCompany = companies.find((c) => c.id === formData.companyId);

  return (
    <div className="login-page position-relative overflow-hidden">
      <div className="container-fluid position-relative">
        <div className="row min-vh-100 g-0">
          {/* Left hero/preview section */}
          <section className="col-lg-7 order-2 order-md-1 d-flex flex-column justify-content-between px-4 px-lg-5 py-4 py-lg-5 login-hero">
            <div>
              <div className="login-badge d-inline-flex align-items-center gap-3 rounded-pill px-3 py-2">
                <div className="login-badge-icon d-inline-flex align-items-center justify-content-center rounded-3">
                  <User size={18} />
                </div>
                <div>
                  <p className="login-badge-overline mb-1 text-uppercase">
                    Client Platform
                  </p>
                  <p className="mb-0 fw-semibold">User Registration</p>
                </div>
              </div>
              <div className="mt-5 pt-lg-4">
                <p className="login-hero-overline mb-3 text-uppercase fw-semibold">
                  Create your account
                </p>
                <h1 className="login-hero-title fw-semibold mb-4">
                  Register to access the client command center.
                </h1>
                <p className="login-hero-text mb-4">
                  Fill out the form to request access for job management, work
                  orders, and more. Your registration will be reviewed by an
                  administrator.
                </p>
              </div>
            </div>
          </section>
          {/* Right registration panel */}
          <section className="col-lg-5 order-1 order-md-2 d-flex align-items-center justify-content-center px-4 px-lg-5 py-5">
            <div className="login-panel w-100 shadow-lg">
              {!submitted && (
                <>
                  {step === 1 && (
                    <form onSubmit={handleNext} noValidate>
                      {/* Company Select */}
                      <div className="mb-3">
                        <label className="form-label login-label">
                          Company
                        </label>
                        <select
                          name="companyId"
                          value={formData.companyId}
                          onChange={handleChange}
                          className={`form-select${errors.companyId ? " is-invalid" : ""}`}
                        >
                          <option value="">Select your company</option>
                          {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {errors.companyId && (
                          <div className="invalid-feedback d-block">
                            {errors.companyId}
                          </div>
                        )}
                        {/* Show company web address if available */}
                        {selectedCompany?.web && (
                          <div className="mt-2 small text-primary">
                            Website:{" "}
                            <a
                              href={selectedCompany.web}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {selectedCompany.web}
                            </a>
                          </div>
                        )}
                      </div>
                      {/* Username */}
                      <div className="mb-3">
                        <label className="form-label login-label">
                          Username
                        </label>
                        <div className="input-group login-input-group">
                          <span className="input-group-text">
                            <User size={18} />
                          </span>
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-control${errors.username ? " is-invalid" : ""}`}
                            placeholder="Choose a username"
                          />
                        </div>
                        {errors.username && (
                          <div className="invalid-feedback d-block">
                            {errors.username}
                          </div>
                        )}
                      </div>
                      {/* Email */}
                      <div className="mb-3">
                        <label className="form-label login-label">Email</label>
                        <div className="input-group login-input-group">
                          <span className="input-group-text">
                            <Mail size={18} />
                          </span>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-control${errors.email ? " is-invalid" : ""}`}
                            placeholder="you@company.com"
                          />
                        </div>
                        {errors.email && (
                          <div className="invalid-feedback d-block">
                            {errors.email}
                          </div>
                        )}
                      </div>
                      {/* Password */}
                      <div className="mb-3">
                        <label className="form-label login-label">
                          Password
                        </label>
                        <div className="input-group login-input-group">
                          <span className="input-group-text">
                            <LockKeyhole size={18} />
                          </span>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-control${errors.password ? " is-invalid" : ""}`}
                            placeholder="Create a password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="btn"
                            tabIndex={-1}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <div className="invalid-feedback d-block">
                            {errors.password}
                          </div>
                        )}
                      </div>
                      {/* Confirm Password */}
                      <div className="mb-3">
                        <label className="form-label login-label">
                          Confirm Password
                        </label>
                        <div className="input-group login-input-group">
                          <span className="input-group-text">
                            <LockKeyhole size={18} />
                          </span>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-control${errors.confirmPassword ? " is-invalid" : ""}`}
                            placeholder="Re-enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="btn"
                            tabIndex={-1}
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <div className="invalid-feedback d-block">
                            {errors.confirmPassword}
                          </div>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="btn login-submit-btn w-100 d-inline-flex align-items-center justify-content-center gap-2 mt-3"
                      >
                        Next
                      </button>
                    </form>
                  )}

                  <p className="form-footer-text mt-3">
                    Already have an account?{" "}
                    <Link to="/" className="form-footer-link">
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;
