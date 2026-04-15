from app import create_app
from app.models import db

# Use DevelopmentConfig locally - reads DB URI and DEBUG from config.py / .env
app = create_app('DevelopmentConfig')

with app.app_context():
    # db.drop_all()
    db.create_all()
app.run(debug=True)