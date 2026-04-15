# Backend Setup - VistaOne API

This document covers everything added or changed in the backend for the vendor, MSA, and services features. Written so another developer can pick up, run, and extend this work.

---

## What Changed From the Previous Backend

The previous backend vendor implementation used:
- A table named `vendors` (plural)
- An ARRAY column to store services on the vendor row
- Field names `contact_email` and `contact_phone`
- Status enum values that did not match frontend expectations

This implementation aligns everything to the ERD that Daniel provided:
- Table is named `vendor` (singular)
- Services are stored in a normalized `vendor_services` junction table
- Contact fields are `company_email` and `company_phone`
- Status enum values are lowercase strings: `active`, `inactive`, `complete`, `incomplete`, `expired`

If you have an existing `vendors` table in your database, drop it before running. The new model creates a `vendor` table.

---

## First-Time Setup

### 1. Create the database (if not done already)

```bash
createdb client_web_dashboard_db
```

Update the connection string in `config.py` under `DevelopmentConfig` to match your local Postgres username. On most Mac installs this is just your system username with no password:

```python
SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://your_username@localhost/client_web_dashboard_db'
```

### 2. Install dependencies

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Run the server

```bash
python app.py
```

Tables are created automatically on startup via `db.create_all()` inside the app factory.

### 4. Seed the database

```bash
python seed.py
```

Creates: 1 demo user, 13 service types, 6 vendors, and MSA records for each vendor.

---

## File Structure

```
vistaone-api/
  app/
    models/
      vendor.py             Vendor table (ERD-aligned)
      services.py           Service catalog table
      vendor_services.py    Junction table linking vendors to services
      msa.py                MSA metadata + file storage reference
      address.py            Address table from ERD
      __init__.py           Imports all models so db.create_all() registers them
    blueprints/
      controller/
        vendor_routes.py    GET, POST, PATCH vendor endpoints
        msa_routes.py       GET, POST, PATCH, download MSA endpoints
        services_routes.py  GET, POST service endpoints
        __init__.py         Blueprint definitions
      services/
        vendor_service.py   Vendor business logic
        msa_service.py      MSA business logic including file saving
        services_service.py Service catalog logic
      repository/
        vendor_repository.py    Vendor DB queries with filter support
        msa_repository.py       MSA DB queries
        services_repository.py  Services DB queries
      schema/
        vendor_schema.py    Marshmallow schema for vendor serialization
        msa_schema.py       Marshmallow schema for MSA serialization
        services_schema.py  Marshmallow schema for services
    utils/
      util.py               encode_token and token_required (python-jose)
    __init__.py             App factory, registers blueprints
  app.py                    Entry point, runs with DevelopmentConfig
  config.py                 DevelopmentConfig, TestingConfig, ProductionConfig
  seed.py                   Demo data seed script
  uploads/
    msa/                    PDF uploads stored here (not in git)
```

---

## Authentication

All vendor, MSA, and services endpoints require a valid JWT token.

The token is issued at `POST /users/login` and must be sent as:

```
Authorization: Bearer <token>
```

The `token_required` decorator in `app/utils/util.py` handles validation. It reads the token, decodes it with python-jose, and injects the current user into the route handler via `current_user_id`.

---

## Vendor Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /vendors/ | Returns all vendors. Optional query params: `status`, `compliance`, `service_id` |
| GET | /vendors/\<vendor_id\> | Returns one vendor with nested services and MSAs |
| POST | /vendors/ | Creates a new vendor. Body must include `company_name`, `company_email`, `company_phone`. Optional: `service_ids` array |
| PATCH | /vendors/\<vendor_id\> | Updates any vendor fields |
| POST | /vendors/\<vendor_id\>/services | Adds a service. Body: `{ "service_id": "..." }` |
| DELETE | /vendors/\<vendor_id\>/services/\<service_id\> | Removes a service from a vendor |

Vendor response shape:

```json
{
  "vendor_id": "uuid",
  "company_name": "Permian Wellbore Services",
  "company_code": "PWS-001",
  "primary_contact_name": "Carlos Mendez",
  "company_email": "cmendez@permianwell.com",
  "company_phone": "(432) 555-0142",
  "status": "active",
  "compliance_status": "complete",
  "description": "...",
  "onboarding": false,
  "services": [
    { "service_id": "uuid", "service": "Wellbore Integrity" }
  ],
  "msas": [
    { "msa_id": "uuid", "version": "1.0", "status": "active", "effective_date": "2025-08-01", "expiration_date": "2026-08-01" }
  ],
  "average_rating": null,
  "completed_work_orders": 0,
  "insurance_policies": [],
  "licenses": []
}
```

Note: `average_rating`, `insurance_policies`, and `licenses` are placeholders. These fields come from the `contractors` table which is not yet implemented.

---

## MSA Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /msa/ | Returns all MSA records with vendor name |
| GET | /msa/\<msa_id\> | Returns one MSA |
| POST | /msa/ | Uploads MSA. Must be multipart/form-data. Fields: `vendor_id`, `version`, `effective_date`, `expiration_date`, `file` (PDF) |
| PATCH | /msa/\<msa_id\> | Updates MSA fields (status, dates) |
| GET | /msa/\<msa_id\>/download | Returns the PDF file as a download |

Upload example (fetch):

```js
const formData = new FormData();
formData.append('vendor_id', vendorId);
formData.append('version', '1.0');
formData.append('effective_date', '2025-01-01');
formData.append('expiration_date', '2026-01-01');
formData.append('file', pdfFile);

fetch('/api/msa/', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
  // Do NOT set Content-Type manually - browser sets it with the boundary
});
```

Uploaded files are saved to `uploads/msa/` with the pattern `<uuid>_<original_filename>.pdf`. The `file_name` column on the MSA record stores this value so the download endpoint can serve the file.

---

## Services Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /services/ | Returns all service types |
| POST | /services/ | Creates a service. Body: `{ "service": "Service Name" }`. Rejects duplicates. |

---

## Models Reference

### vendor

| Column | Type | Notes |
|--------|------|-------|
| vendor_id | UUID string PK | |
| company_name | String(150) | Required, unique |
| company_code | String(20) | Optional |
| primary_contact_name | String(100) | |
| company_email | String(150) | Required |
| company_phone | String(30) | |
| status | Enum | VendorStatus: active / inactive |
| compliance_status | Enum | ComplianceStatus: complete / incomplete / expired |
| description | Text | |
| onboarding | Boolean | Default False |
| created_by | String (FK to user) | |
| updated_by | String | |
| created_at | DateTime | Auto UTC |
| updated_at | DateTime | Auto UTC |

### msa

| Column | Type | Notes |
|--------|------|-------|
| msa_id | UUID string PK | |
| vendor_id | FK to vendor | |
| version | String(10) | |
| status | String(15) | active / expired / incomplete |
| effective_date | Date | |
| expiration_date | Date | |
| file_name | String(255) | Stored filename in uploads/msa/. Not in original ERD - added for local file storage. |
| uploaded_by | String (FK to user) | |
| created_by | String | |
| created_at | DateTime | Auto UTC |

---

## ERD Alignment Notes

The ERD provided by Daniel defines these tables (among others):
- `vendor` (singular)
- `msa` with msa_requirements as a separate table
- `services` and `vendor_services` junction
- `address` shared across vendors, users, clients
- `compliance_document` (not yet built)
- `contractors`, `work_orders`, `ticket`, `invoices` (not yet built)

Tables still missing from this implementation:
- compliance_document
- contractors (blocks insurance_policies and licenses on vendor detail)
- invoices
- full work_orders implementation
- ticket

---

## Dependency Notes

Make sure these are in your `requirements.txt`:

```
Flask
Flask-SQLAlchemy
Flask-Marshmallow
marshmallow-sqlalchemy
marshmallow
python-jose[cryptography]
psycopg2-binary
python-dotenv
werkzeug
flask-caching
```

---

## Quick Verification

After setup, run through this flow in Postman or your HTTP client:

1. `POST /users/login` with `{ "email": "admin@vistaone.com", "password": "password123" }` - copy the token
2. `GET /services/` with the Bearer token - should return 13 services
3. `GET /vendors/` with the Bearer token - should return 6 vendors
4. `GET /vendors/<any_vendor_id>` - should return services and msas arrays
5. `GET /msa/` - should return 6 MSA records with vendor names
