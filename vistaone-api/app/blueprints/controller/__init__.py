from flask import Blueprint

users_bp = Blueprint("users", __name__)

workorder_bp = Blueprint("workorder", __name__)

vendor_bp = Blueprint('vendor', __name__)



from .auth_routes import users_bp
from .vendor_routes import vendor_bp
