from . import users_bp
from flask import request, jsonify
from marshmallow import ValidationError
from sqlalchemy import select
from app.models import db, User
from app.extensions import limiter
from app.utils.util import encode_token
from .schemas import login_schema
from .schemas import login_schema, register_schema  # add register_schema here

@users_bp.route("/login", methods=['POST'])
@limiter.limit("10 per minute")
def login():
    try:
        credentials = login_schema.load(request.json)
        email = credentials['email']
        password = credentials['password']
    except ValidationError as e:
        return jsonify(e.messages), 400

    query = select(User).where(User.email == email)
    user = db.session.execute(query).scalars().first()

    if user and user.check_password(password):
        token = encode_token(user.id)

        response = {
            "status": "success",
            "message": "Successfully Logged In",
            "token": token
        }
        
        return jsonify(response), 200
    else:
        return jsonify({'message': "Invalid email or password"}), 401

@users_bp.route("/register", methods=['POST'])
@limiter.limit("5 per minute")
def register():
    try:
        user_data = register_schema.load(request.json)
    except ValidationError as e:
        return jsonify(e.messages), 400

    # Check if email already exists
    query = select(User).where(User.email == user_data['email'])
    existing_user = db.session.execute(query).scalars().first()

    if existing_user:
        return jsonify({'message': 'Email already registered'}), 409

    # Create new user
    new_user = User(
        first_name=user_data['first_name'],
        last_name=user_data['last_name'],
        email=user_data['email'],
        role_id=user_data.get('role_id', 1),
        company_id=user_data.get('company_id', 1)
    )
    new_user.set_password(user_data['password'])

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'id': new_user.id}), 201