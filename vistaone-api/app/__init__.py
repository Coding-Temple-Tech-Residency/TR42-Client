from flask import Flask, jsonify
from .extensions import ma, limiter
from .models import db
from .blueprints.users import users_bp
from flask_swagger_ui import get_swaggerui_blueprint
import logging
import os
from dotenv import load_dotenv


# Load .env file
load_dotenv()

SWAGGER_URL = '/api/docs'  # URL for exposing Swagger UI (without trailing '/')
API_URL = '/static/swagger.yaml'  # Our API URL (can of course be a local resource)

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Client Web Dashboard"
    }
)

def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(f'config.{config_name}')
    
    # Initialize extensions
    ma.init_app(app)
    db.init_app(app)
    limiter.init_app(app)
    
    # Register blueprints
    app.register_blueprint(users_bp, url_prefix='/users')
    app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

    @app.errorhandler(429)
    def handle_rate_limit(_):
        return jsonify({'message': 'Too many requests. Please try again later.'}), 429
    

    # Get log level and file name from .env
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    log_file = os.getenv("LOG_FILE", "client-web.log")
    format_env = os.getenv("FORMAT","%(asctime)s - %(levelname)s - %(name)s - %(message)s")

    # Configure logging
    logging.basicConfig(
        filename=log_file,
        level=log_level,
        format=format_env
    )
    

    # Optional: Also log to console
    console = logging.StreamHandler()
    console.setLevel(log_level)
    formatter = logging.Formatter(format_env)
    console.setFormatter(formatter)
    logging.getLogger("").addHandler(console)
    
    return app
