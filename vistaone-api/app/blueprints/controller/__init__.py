
# app/controllers/__init__.py

from .auth_routes import auth_bp
from .vendor_routes import vendor_bp
from .workorder_routes import workorder_bp

__all__ = [
    "auth_bp",
    "vendor_bp",
    "workorder_bp",
]