# VistaOne - TR42 Client Project

## Project Information

**Project Name:** VistaOne Vendor and Contract Management Platform
**Team Name:** TR42-Client
**Cohort / Sprint:** Coding Temple Tech Residency
**Team Members:** Thomas Lappas (frontend lead), Shaney (backend vendor features), Daniel (ERD / schema)
**Tech Stack:** React + Vite (frontend), Flask + SQLAlchemy + PostgreSQL (backend), python-jose (JWT auth)

---

## Project Overview

VistaOne is an internal operations platform for managing oilfield service vendors, master service agreements (MSAs), work orders, and compliance tracking.

- **Problem it solves:** Centralizes vendor onboarding, contract management, and work order dispatch for field operations teams
- **Target user:** Operations managers and procurement staff at oil and gas companies
- **Core features completed:**
  - JWT-based login and protected routes
  - Vendor directory with filtering by status, compliance, and service type
  - Vendor detail view with services, MSAs, and compliance info
  - Add vendor form with service assignment
  - Contracts / MSA page with PDF upload (drag-and-drop) and downloadable MSA table
  - Work order creation and vendor assignment flow
  - App shell layout with sidebar navigation and top bar

---

## Repo Structure

```
TR42-Client/
  vistaone-api/     Flask REST API (backend)
  vistaone-web/     React + Vite app (frontend)
```

---

## Setup Instructions

### Requirements

- Python 3.10+
- Node 18+
- PostgreSQL (running locally)

### 1. Create the database

```bash
createdb client_web_dashboard_db
```

### 2. Backend setup

```bash
cd vistaone-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

Flask runs on `http://127.0.0.1:5000`. The database tables are created automatically on first run via `db.create_all()`.

### 3. Seed the database

In a separate terminal (with the venv active):

```bash
cd vistaone-api
python seed.py
```

This creates:
- 1 demo user: `admin@vistaone.com` / `password123`
- 13 service types
- 6 vendors with linked services and MSA records

Safe to re-run. Skips records that already exist.

### 4. Frontend setup

```bash
cd vistaone-web
npm install
npm run dev
```

Vite runs on `http://localhost:5173`. API requests to `/api/*` are proxied to Flask on port 5000.

### 5. Login

Open `http://localhost:5173` and log in with:

```
Email:    admin@vistaone.com
Password: password123
```

---

## API Endpoints

All endpoints except `/users/login` require a Bearer token in the `Authorization` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /users/login | Login, returns JWT token |
| GET | /vendors/ | List all vendors (supports ?status=, ?compliance=, ?service_id= filters) |
| GET | /vendors/\<id\> | Get single vendor with services and MSAs |
| POST | /vendors/ | Create new vendor |
| PATCH | /vendors/\<id\> | Update vendor fields |
| POST | /vendors/\<id\>/services | Add a service to a vendor |
| DELETE | /vendors/\<id\>/services/\<service_id\> | Remove a service from a vendor |
| GET | /msa/ | List all MSAs |
| GET | /msa/\<id\> | Get single MSA |
| POST | /msa/ | Upload MSA (multipart/form-data with vendor_id, version, effective_date, expiration_date, file) |
| PATCH | /msa/\<id\> | Update MSA status or dates |
| GET | /msa/\<id\>/download | Download the MSA PDF file |
| GET | /services/ | List all service types |
| POST | /services/ | Create new service type |

---

## Backend Architecture

The backend follows the Coding Temple (CT) layered structure:

```
app/
  models/           SQLAlchemy models (one file per table)
  blueprints/
    controller/     Flask routes (Blueprint per feature)
    services/       Business logic layer
    repository/     Database query layer
    schema/         Marshmallow serialization schemas
  utils/
    util.py         encode_token / token_required (python-jose)
```

### Models built (ERD-aligned)

| File | Table | Notes |
|------|-------|-------|
| models/vendor.py | vendor | Uses VendorStatus and ComplianceStatus str enums |
| models/services.py | services | Service catalog |
| models/vendor_services.py | vendor_services | Junction table with audit fields |
| models/msa.py | msa | MSA metadata + file_name for local PDF storage |
| models/address.py | address | Shared address table from ERD |

### Key ERD alignment notes

- Table name is `vendor` (singular), not `vendors`
- Contact fields are `company_email` and `company_phone` (not `contact_email`)
- Vendor status enum values are lowercase: `active`, `inactive`
- Compliance status values: `complete`, `incomplete`, `expired`
- Services are stored in a normalized junction table (`vendor_services`), not as an array on the vendor row
- `msa` table has a `file_name` column not in the original ERD. This was added to support local PDF storage without needing a separate document-storage table for the initial implementation.

---

## Test Credentials

```
Email:    admin@vistaone.com
Password: password123
Role:     operator (role_id = 1, company_id = 1)
```

---

## Known Limitations

- `average_rating` and `completed_work_orders` on vendor detail return null / 0. These fields come from the `contractors` and `work_orders` tables which are not fully implemented yet.
- Insurance policies and licenses on vendor detail return empty arrays for the same reason.
- PDF uploads are stored locally in `vistaone-api/uploads/msa/`. This directory is git-ignored and needs to exist on each developer machine (it is created automatically when the first upload happens).
- The `compliance_document` table from the ERD is not yet implemented.

---

## Branch Information

Current branch: `feature/contracts-msa`

This branch contains all frontend and backend work for the vendor, contracts, and MSA features. It is safe to merge to `main`. The only file modified on both this branch and potentially elsewhere is `vistaone-web/src/routes/ProtectedRoute.jsx`.

Before merging, confirm there are no open PRs touching `ProtectedRoute.jsx` on main.
