from .auth_routes import users_bp
from .workorder_routes import workorder_bp
from .well_routes import well_bp



__all__= [
    "users_bp",
    "workorder_bp",
    "well_bp"
]