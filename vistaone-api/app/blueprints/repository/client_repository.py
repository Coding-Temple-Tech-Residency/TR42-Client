from app.models.client import Client
from app.extensions import db
from sqlalchemy.exc import SQLAlchemyError


class ClientRepository:
    @staticmethod
    def get_client_by_email(email):
        return db.session.query(Client).filter_by(company_email=email).first()

    @staticmethod
    def get_client_by_code(code):
        return db.session.query(Client).filter_by(client_code=code).first()

    @staticmethod
    def create_client(client):
        try:
            db.session.add(client)
            db.session.commit()
            return client
        except SQLAlchemyError:
            db.session.rollback()
            raise
