import { useState, useEffect } from "react";
import { useRegisterClient } from "../hooks/useRegisterClient";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/login.css";
import {
    Mail,
    Phone,
    MapPin,
    Building2,
    Globe,
    Hash,
    User,
    ArrowRight,
} from "lucide-react";

const initialState = {
    client_name: "",
    client_code: "",
    company_email: "",
    company_contact_number: "",
    company_web_address: "",
    primary_contact_name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
};

function RegisterClient() {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);
    const [registrationComplete, setRegistrationComplete] = useState(false);

    const { submitClientRegistration, loading, error, success } =
        useRegisterClient();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    function validateStep1() {
        const newErrors = {};

        const client_name = formData.client_name.trim();
        const client_code = formData.client_code.trim();
        const company_email = formData.company_email.trim().toLowerCase();
        const company_contact_number = formData.company_contact_number.trim();
        const company_web_address = formData.company_web_address.trim();

        if (!client_name) {
            newErrors.client_name = "Company name is required";
        } else if (client_name.length < 2) {
            newErrors.client_name = "Company name must be at least 2 characters";
        }

        if (!client_code) {
            newErrors.client_code = "Client code is required";
        } else if (!/^[a-zA-Z0-9_-]{2,}$/.test(client_code)) {
            newErrors.client_code =
                "Code must be alphanumeric (letters, numbers, dashes, underscores)";
        }

        if (!company_email) {
            newErrors.company_email = "Company email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company_email)) {
            newErrors.company_email = "Invalid email address";
        }

        if (!company_contact_number) {
            newErrors.company_contact_number = "Contact number is required";
        } else if (
            !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(
                company_contact_number
            )
        ) {
            newErrors.company_contact_number = "Invalid phone number";
        }

        if (
            company_web_address &&
            !/^https?:\/\/.+\..+/.test(company_web_address)
        ) {
            newErrors.company_web_address =
                "Must be a valid URL (e.g. https://example.com)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    function validateStep2() {
        const newErrors = {};

        const primary_contact_name = formData.primary_contact_name.trim();
        const street = formData.street.trim();
        const city = formData.city.trim();
        const state = formData.state.trim();
        const zip = formData.zip.trim();
        const country = formData.country.trim();

        if (!primary_contact_name) {
            newErrors.primary_contact_name = "Primary contact name is required";
        } else if (!/^[a-zA-Z\s'-]+$/.test(primary_contact_name)) {
            newErrors.primary_contact_name = "Only letters are allowed";
        }

        if (!street) {
            newErrors.street = "Street is required";
        } else if (street.length < 5) {
            newErrors.street = "Address is too short";
        }

        if (!city) {
            newErrors.city = "City is required";
        } else if (!/^[a-zA-Z\s'-]{2,}$/.test(city)) {
            newErrors.city = "Invalid city name";
        }

        if (!state) {
            newErrors.state = "State is required";
        } else if (!/^[a-zA-Z\s'-]{2,}$/.test(state)) {
            newErrors.state = "Invalid state name";
        }

        if (!zip) {
            newErrors.zip = "ZIP code is required";
        } else if (!/^\d{5}(-\d{4})?$/.test(zip)) {
            newErrors.zip = "Invalid ZIP code";
        }

        if (!country) {
            newErrors.country = "Country is required";
        } else if (country.length < 2) {
            newErrors.country = "Invalid country";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    const handleNext = (e) => {
        e.preventDefault();
        if (validateStep1()) setStep(2);
    };

    const handleBack = (e) => {
        e.preventDefault();
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;
        await submitClientRegistration(formData);
    };

    useEffect(() => {
        if (success) {
            setRegistrationComplete(true);
            setFormData(initialState);
        }
    }, [success]);

    return (
        <div className="login-page position-relative overflow-hidden">
            <div className="container-fluid position-relative">
                <div className="row min-vh-100 g-0">
                    {/* Left hero section */}
                    <section className="col-lg-7 order-2 order-md-1 d-flex flex-column justify-content-between px-4 px-lg-5 py-4 py-lg-5 login-hero">
                        <div>
                            <div className="login-badge d-inline-flex align-items-center gap-3 rounded-pill px-3 py-2">
                                <div className="login-badge-icon d-inline-flex align-items-center justify-content-center rounded-3">
                                    <Building2 size={18} />
                                </div>
                                <div>
                                    <p className="login-badge-overline mb-1 text-uppercase">
                                        Client Platform
                                    </p>
                                    <p className="mb-0 fw-semibold">
                                        Client Registration
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 pt-lg-4">
                                <p className="login-hero-overline mb-3 text-uppercase fw-semibold">
                                    Register your company
                                </p>
                                <h1 className="login-hero-title fw-semibold mb-4">
                                    Onboard your company to the client command
                                    center.
                                </h1>
                                <p className="login-hero-text mb-4">
                                    Register your organization to gain access to
                                    vendor management, work order tracking,
                                    compliance monitoring, and invoice review.
                                    Your registration will be reviewed by an
                                    administrator.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Right registration panel */}
                    <section className="col-lg-5 order-1 order-md-2 d-flex align-items-center justify-content-center px-4 px-lg-5 py-5">
                        <div className="login-panel w-100 shadow-lg">
                            {error && (
                                <div
                                    className="alert alert-danger login-alert mb-4"
                                    role="alert"
                                >
                                    {error}
                                </div>
                            )}
                            {loading && (
                                <div className="text-center mb-3">
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        role="status"
                                        aria-hidden="true"
                                    ></span>{" "}
                                    Registering...
                                </div>
                            )}

                            {registrationComplete ? (
                                <div className="text-center py-5">
                                    <h2 className="mb-3">
                                        Registration Successful!
                                    </h2>
                                    <p className="mb-4">
                                        Your company has been registered
                                        successfully.
                                    </p>
                                    <Link
                                        to="/login"
                                        className="btn login-submit-btn d-inline-flex align-items-center gap-2 px-4"
                                    >
                                        Go to Login
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-4">
                                        <p className="login-panel-overline mb-2 text-uppercase">
                                            Step {step} of 2
                                        </p>
                                        <h2 className="mb-2">
                                            {step === 1
                                                ? "Company Details"
                                                : "Contact & Address"}
                                        </h2>
                                        <p className="login-panel-text">
                                            {step === 1
                                                ? "Enter your company's basic information."
                                                : "Provide the primary contact and registered address."}
                                        </p>
                                    </div>

                                    {step === 1 && (
                                        <form onSubmit={handleNext} noValidate>
                                            {/* Company Name */}
                                            <div className="mb-3">
                                                <label className="form-label login-label">
                                                    Company Name
                                                </label>
                                                <div className="input-group login-input-group">
                                                    <span className="input-group-text">
                                                        <Building2 size={18} />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="client_name"
                                                        value={
                                                            formData.client_name
                                                        }
                                                        onChange={handleChange}
                                                        className={`form-control${errors.client_name ? " is-invalid" : ""}`}
                                                        placeholder="Acme Corporation"
                                                    />
                                                </div>
                                                {errors.client_name && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.client_name}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Client Code */}
                                            <div className="mb-3">
                                                <label className="form-label login-label">
                                                    Client Code
                                                </label>
                                                <div className="input-group login-input-group">
                                                    <span className="input-group-text">
                                                        <Hash size={18} />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="client_code"
                                                        value={
                                                            formData.client_code
                                                        }
                                                        onChange={handleChange}
                                                        className={`form-control${errors.client_code ? " is-invalid" : ""}`}
                                                        placeholder="ACME-01"
                                                    />
                                                </div>
                                                {errors.client_code && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.client_code}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Company Email */}
                                            <div className="mb-3">
                                                <label className="form-label login-label">
                                                    Company Email
                                                </label>
                                                <div className="input-group login-input-group">
                                                    <span className="input-group-text">
                                                        <Mail size={18} />
                                                    </span>
                                                    <input
                                                        type="email"
                                                        name="company_email"
                                                        value={
                                                            formData.company_email
                                                        }
                                                        onChange={handleChange}
                                                        className={`form-control${errors.company_email ? " is-invalid" : ""}`}
                                                        placeholder="info@company.com"
                                                    />
                                                </div>
                                                {errors.company_email && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.company_email}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Company Contact Number */}
                                            <div className="mb-3">
                                                <label className="form-label login-label">
                                                    Contact Number
                                                </label>
                                                <div className="input-group login-input-group">
                                                    <span className="input-group-text">
                                                        <Phone size={18} />
                                                    </span>
                                                    <input
                                                        type="tel"
                                                        name="company_contact_number"
                                                        value={
                                                            formData.company_contact_number
                                                        }
                                                        onChange={handleChange}
                                                        className={`form-control${errors.company_contact_number ? " is-invalid" : ""}`}
                                                        placeholder="(555) 123-4567"
                                                    />
                                                </div>
                                                {errors.company_contact_number && (
                                                    <div className="invalid-feedback d-block">
                                                        {
                                                            errors.company_contact_number
                                                        }
                                                    </div>
                                                )}
                                            </div>

                                            {/* Web Address */}
                                            <div className="mb-4">
                                                <label className="form-label login-label">
                                                    Website{" "}
                                                    <span className="text-muted fw-normal">
                                                        (optional)
                                                    </span>
                                                </label>
                                                <div className="input-group login-input-group">
                                                    <span className="input-group-text">
                                                        <Globe size={18} />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="company_web_address"
                                                        value={
                                                            formData.company_web_address
                                                        }
                                                        onChange={handleChange}
                                                        className={`form-control${errors.company_web_address ? " is-invalid" : ""}`}
                                                        placeholder="https://company.com"
                                                    />
                                                </div>
                                                {errors.company_web_address && (
                                                    <div className="invalid-feedback d-block">
                                                        {
                                                            errors.company_web_address
                                                        }
                                                    </div>
                                                )}
                                            </div>

                                            <button
                                                type="submit"
                                                className="btn login-submit-btn w-100 d-inline-flex align-items-center justify-content-center gap-2"
                                            >
                                                Next
                                                <ArrowRight size={16} />
                                            </button>
                                        </form>
                                    )}

                                    {step === 2 && (
                                        <form
                                            onSubmit={handleSubmit}
                                            noValidate
                                        >
                                            {/* Primary Contact Name */}
                                            <div className="mb-3">
                                                <label className="form-label login-label">
                                                    Primary Contact Name
                                                </label>
                                                <div className="input-group login-input-group">
                                                    <span className="input-group-text">
                                                        <User size={18} />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="primary_contact_name"
                                                        value={
                                                            formData.primary_contact_name
                                                        }
                                                        onChange={handleChange}
                                                        className={`form-control${errors.primary_contact_name ? " is-invalid" : ""}`}
                                                        placeholder="Jane Smith"
                                                    />
                                                </div>
                                                {errors.primary_contact_name && (
                                                    <div className="invalid-feedback d-block">
                                                        {
                                                            errors.primary_contact_name
                                                        }
                                                    </div>
                                                )}
                                            </div>

                                            {/* Street */}
                                            <div className="mb-3">
                                                <label className="form-label login-label">
                                                    Address Line 1
                                                </label>
                                                <div className="input-group login-input-group">
                                                    <span className="input-group-text">
                                                        <MapPin size={18} />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        name="street"
                                                        value={formData.street}
                                                        onChange={handleChange}
                                                        className={`form-control${errors.street ? " is-invalid" : ""}`}
                                                        placeholder="123 Main St"
                                                    />
                                                </div>
                                                {errors.street && (
                                                    <div className="invalid-feedback d-block">
                                                        {errors.street}
                                                    </div>
                                                )}
                                            </div>

                                            {/* City / State / ZIP / Country */}
                                            <div className="row g-2">
                                                <div className="col-md-4 mb-3">
                                                    <label className="form-label login-label">
                                                        City
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className={`form-control${errors.city ? " is-invalid" : ""}`}
                                                        placeholder="City"
                                                    />
                                                    {errors.city && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.city}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <label className="form-label login-label">
                                                        State
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="state"
                                                        value={formData.state}
                                                        onChange={handleChange}
                                                        className={`form-control${errors.state ? " is-invalid" : ""}`}
                                                        placeholder="State"
                                                    />
                                                    {errors.state && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.state}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-3 mb-3">
                                                    <label className="form-label login-label">
                                                        ZIP
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zip"
                                                        value={formData.zip}
                                                        onChange={handleChange}
                                                        className={`form-control${errors.zip ? " is-invalid" : ""}`}
                                                        placeholder="ZIP"
                                                    />
                                                    {errors.zip && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.zip}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="col-md-2 mb-3">
                                                    <label className="form-label login-label">
                                                        Country
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="country"
                                                        value={formData.country}
                                                        onChange={handleChange}
                                                        className={`form-control${errors.country ? " is-invalid" : ""}`}
                                                        placeholder="US"
                                                    />
                                                    {errors.country && (
                                                        <div className="invalid-feedback d-block">
                                                            {errors.country}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="d-flex gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary w-50"
                                                    onClick={handleBack}
                                                >
                                                    Back
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="btn login-submit-btn w-50 d-inline-flex align-items-center justify-content-center gap-2"
                                                >
                                                    Register
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    <p className="form-footer-text mt-3">
                                        Already have an account?{" "}
                                        <Link
                                            to="/login"
                                            className="form-footer-link"
                                        >
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

export default RegisterClient;
