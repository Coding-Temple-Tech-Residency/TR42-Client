from app.models.user import User
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError


class UserRepository:
    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()

    @staticmethod
    def get_user_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def get_users_by_client(client_id):
        return User.query.filter_by(client_id=client_id).all()

    @staticmethod
    def get_pending_users_by_client(client_id):
        from app.blueprints.enum.enums import UserStatus
        return User.query.filter_by(
            client_id=client_id, status=UserStatus.PENDING_APPROVAL
        ).all()

    @staticmethod
    def create_user(user: User):
        try:
            db.session.add(user)
            db.session.commit()
            return user
        except SQLAlchemyError:
            db.session.rollback()
            raise

    @staticmethod
    def update_user(user, data):
        allowed = {"first_name", "last_name", "contact_number", "status"}
        for field in allowed:
            if field in data:
                setattr(user, field, data[field])
        try:
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            raise
        return user

    @staticmethod
    def update_user_status(user, status):
        user.status = status
        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            raise
        return user

    @staticmethod
    def set_user_roles(user, role_names, client_id):
        from app.models.role import Role
        roles = []
        for name in role_names:
            role = Role.query.filter_by(name=name, client_id=client_id).first()
            if role:
                roles.append(role)
        user.roles = roles
        try:
            db.session.commit()
        except SQLAlchemyError:
            db.session.rollback()
            raise
        return user
