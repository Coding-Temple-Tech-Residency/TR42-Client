from flask import Flask, g, jsonify
from app.extensions import ma, limiter, db
from app.blueprints.controller import (
    users_bp,
    workorder_bp,
    well_bp,
    vendor_bp,
    msa_bp,
    invoice_bp,
    clients_bp,
    admin_bp,
    role_bp,
    profile_bp,
    ticket_bp,
)
from app.utils.logging_util import logging_setup
from flask_swagger_ui import get_swaggerui_blueprint
from dotenv import load_dotenv
from flask_cors import CORS
from app.extensions import mail
from sqlalchemy import event

load_dotenv()

SWAGGER_URL = "/api/docs"
API_URL = "/static/swagger.yaml"

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL, API_URL, config={"app_name": "Client Web Dashboard"}
)

_audit_hooks_registered = False


def _register_audit_hooks(db_instance):
    global _audit_hooks_registered
    if _audit_hooks_registered:
        return
    _audit_hooks_registered = True

    @event.listens_for(db_instance.session, "before_flush")
    def set_audit_fields(session, flush_context, instances):
        from app.models.user import User

        current_user_id = getattr(g, "current_user_id", None)

        for obj in session.new:
            if hasattr(obj, "created_by") and obj.created_by is None:
                if isinstance(obj, User):
                    obj.created_by = obj.id
                elif current_user_id:
                    obj.created_by = current_user_id
            if hasattr(obj, "updated_by") and obj.updated_by is None:
                if isinstance(obj, User):
                    obj.updated_by = obj.id
                elif current_user_id:
                    obj.updated_by = current_user_id

        for obj in session.dirty:
            if hasattr(obj, "updated_by") and current_user_id:
                obj.updated_by = current_user_id


def create_app(config_name="ProductionConfig"):
    app = Flask(__name__)
    app.config.from_object(f"config.{config_name}")

    app.url_map.strict_slashes = False

    ma.init_app(app)
    db.init_app(app)
    limiter.init_app(app)
    mail.init_app(app)

    logging_setup()

    _register_audit_hooks(db)

    app.register_blueprint(users_bp, url_prefix="/users")
    app.register_blueprint(workorder_bp, url_prefix="/workorders")
    app.register_blueprint(well_bp, url_prefix="/wells")
    app.register_blueprint(vendor_bp, url_prefix="/vendors")
    app.register_blueprint(msa_bp, url_prefix="/msa")
    app.register_blueprint(invoice_bp, url_prefix="/invoices")
    app.register_blueprint(clients_bp, url_prefix="/clients")
    app.register_blueprint(admin_bp, url_prefix="/admin")
    app.register_blueprint(role_bp, url_prefix="/admin/roles")
    app.register_blueprint(ticket_bp, url_prefix="/tickets")
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    CORS(
        app,
        origins=["http://localhost:5173"],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    @app.errorhandler(429)
    def handle_rate_limit(_):
        return jsonify({"message": "Too many requests. Please try again later."}), 429

    @app.errorhandler(401)
    def unauthorized_error(e):
        return jsonify({"status": "error", "message": "Unauthorized access"}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"status": "error", "message": "Internal server error"}), 500

    return app
