from flask import request, jsonify, Blueprint
from marshmallow import ValidationError
from app.extensions import limiter, db
from app.blueprints.schema.auth_schema import login_schema
from app.blueprints.services.auth_service import LoginService
from app.models.user import User
from app.utils.util import token_required
import logging


users_bp = Blueprint("users_bp", __name__)


logger = logging.getLogger(__name__)

# Endpoint to verify JWT token validity
@users_bp.route("/verify-token", methods=["GET"])
@token_required
def verify_token(user_id):
    logger.info(f"Token verification requested for user ID")
    return jsonify({"message": "Token is valid!", "user_id": user_id}), 200

@users_bp.route("/login", methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        credentials = login_schema.load(request.json)


    except ValidationError as e:
        return jsonify(e.messages), 400

    email = credentials["email"]
    password = credentials["password"]

    logger.info(f"Login attempt for email")

    response, status_code = LoginService.login_user(email, password)

    return jsonify(response), status_code
    

@users_bp.route("/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.get_json() or {}

    required = ["firstName", "lastName", "email", "password", "company", "role"]
    missing = [f for f in required if not data.get(f, "").strip()]
    if missing:
        return jsonify({"message": f"Missing required fields: {', '.join(missing)}"}), 400

    email = data["email"].strip().lower()
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "An account with this email already exists"}), 409

    password = data["password"]
    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    try:
        user = User(
            first_name=data["firstName"].strip(),
            last_name=data["lastName"].strip(),
            email=email,
            role_id=data["role"].strip(),
            company_id=data["company"].strip(),
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        logger.error(f"Registration failed: {str(e)}")
        return jsonify({"message": "Registration failed. Please try again."}), 500

    logger.info(f"New user registered: {email}")
    return jsonify({"message": "Registration successful"}), 201


@users_bp.route("/logout", methods=["POST"])
@token_required
def logout(user_id):
    logger.info(f"Logout request received for user ID:")
    response, status_code = LoginService.logout_user(user_id)
    logger.info(f"Logout response: {response}, Status Code: {status_code}")
    response = {
        "status": "success",
        "message": "Successfully logged out"
    }
    return jsonify(response), status_code