from flask import Flask, jsonify
from .extensions import ma, limiter
from app.models import db
from app.blueprints.controller import users_bp, vendors_bp, msa_bp, services_bp
from flask_swagger_ui import get_swaggerui_blueprint
from app.utils.loggingUtil import logging_setup
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

SWAGGER_URL = '/api/docs'
API_URL = '/static/swagger.yaml'

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={'app_name': "Client Web Dashboard"}
)


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name}')

    # Initialize extensions
    ma.init_app(app)
    db.init_app(app)
    limiter.init_app(app)

    logging_setup()

    # Register blueprints - url_prefix must match what the Vite proxy strips /api from
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(vendors_bp, url_prefix='/vendors')
    app.register_blueprint(msa_bp, url_prefix='/msa')
    app.register_blueprint(services_bp, url_prefix='/services')
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)
    
    CORS(
        app,
        origins = ["http://localhost:5173"],
        allow_headers = ["Content-Type", "Authorization"],
        methods =["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # Create any tables that don't exist yet
    # db.create_all() is non-destructive - it only adds missing tables, never drops existing ones
    with app.app_context():
        db.create_all()

    @app.errorhandler(429)
    def handle_rate_limit(_):
        return jsonify({'message': 'Too many requests. Please try again later.'}), 429

    @app.errorhandler(401)
    def unauthorized_error(e):
        return jsonify({'status': 'error', 'message': 'Unauthorized access'}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'status': 'error', 'message': 'Resource not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'status': 'error', 'message': 'Internal server error'}), 500

    return app
