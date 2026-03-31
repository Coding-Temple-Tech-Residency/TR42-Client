# tests/test_services/test_users_service.py

from app.blueprints.services.loginService import LoginService
from app import create_app
from app.models import db, User
import unittest

class TestUsersService(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        self.user = User(first_name="Test", last_name="User", email="test@email.com")
        self.user.set_password("test")
        with self.app.app_context():
            db.drop_all()
            db.create_all()
            db.session.add(self.user)
            db.session.commit()

    def test_login_service_success(self):
        response, status = LoginService.login("test@email.com", "test")
        self.assertEqual(status, 200)
        self.assertEqual(response["status"], "success")
        self.assertIn("token", response)

    def test_login_service_invalid(self):
        response, status = LoginService.login("wrong@email.com", "test")
        self.assertEqual(status, 401)
        self.assertEqual(response["message"], "Invalid email or password")