from flask import Blueprint

# Auth blueprint (already exists - handles login and token verification)
users_bp = Blueprint("users_bp", __name__)

# Vendor blueprint - CRUD for the vendor table
vendors_bp = Blueprint("vendors_bp", __name__)

# MSA blueprint - document upload and MSA metadata management
msa_bp = Blueprint("msa_bp", __name__)

# Services blueprint - catalog of service types vendors can offer
services_bp = Blueprint("services_bp", __name__)

# Import route files so Flask registers the endpoints on each blueprint
from . import auth_routes
from . import vendor_routes
from . import msa_routes
from . import services_routes
