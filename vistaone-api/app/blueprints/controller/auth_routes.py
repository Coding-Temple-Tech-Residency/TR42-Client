
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from app.extensions import limiter,db
from app.blueprints.schemas.auth_schema import login_schema
from app.blueprints.services.auth_service import LoginService
from app.models import User


users_bp = Blueprint("users_bp", __name__, url_prefix="/users")


@users_bp.route("/login", methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        credentials = login_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400

    email = credentials["email"]
    password = credentials["password"]

    response, status_code = LoginService.login_user(email, password)
    return jsonify(response), status_code