import os
from dotenv import load_dotenv

load_dotenv()

class DevelopmentConfig:
    # DB URI is loaded from .env so each developer sets their own local Postgres credentials
    # Create a .env file with: SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://<username>@localhost/client_web_dashboard_db
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'
    CACHE_DEFAULT_TIMEOUT = 300

class TestingConfig:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    TESTING = True
    DEBUG = True
    CACHE_TYPE = 'SimpleCache'

class ProductionConfig:
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
    CACHE_TYPE = 'SimpleCache'
