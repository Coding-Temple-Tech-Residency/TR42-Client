
from app.models.user import User
from app.extensions import db


class UserProfileRepository:

    @staticmethod
    def get_by_id(user_id):
        return  db.session.get(User,user_id)

    @staticmethod
    def update_user():
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise

    @staticmethod
    def delete_user():
     
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise
