# tests/test_repositories/test_user_repository.py
from app.blueprints.repository.loginRepository import LoginRepository
from app import create_app
from app.models import db, User
import unittest

class TestUserRepository(unittest.TestCase):
    def setUp(self):
        self.app = create_app("TestingConfig")
        self.user = User(first_name="Test", last_name="User", email="test@email.com")
        with self.app.app_context():
            db.drop_all()
            db.create_all()
            db.session.add(self.user)
            db.session.commit()

    def test_get_user_by_email(self):
        user = LoginRepository.get_user_by_email("test@email.com")
        self.assertIsNotNone(user)
        self.assertEqual(user.email, "test@email.com")

    def test_get_user_by_email_not_found(self):
        user = LoginRepository.get_user_by_email("notfound@email.com")
        self.assertIsNone(user)