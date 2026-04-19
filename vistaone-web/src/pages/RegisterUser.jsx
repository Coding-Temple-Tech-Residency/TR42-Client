import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
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

function RegisterUser() {
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
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;
