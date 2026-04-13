from flask import Flask
from app.extensions import db, ma


def create_app(config_name="ProductionConfig"):
    app = Flask(__name__)
    app.config.from_object(f"config.{config_name}")

    db.init_app(app)
    ma.init_app(app)

    # import blueprints AFTER db is created
    from app.blueprints.controller.vendor_routes import vendor_bp
    app.register_blueprint(vendor_bp)
    
    return app
