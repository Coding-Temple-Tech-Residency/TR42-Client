from sqlalchemy import select
from app.models import db
from app.models.services import Service


class ServicesRepository:

    @staticmethod
    def get_all():
        """Return every service in the catalog."""
        query = select(Service).order_by(Service.service)
        return db.session.execute(query).scalars().all()

    @staticmethod
    def get_by_id(service_id):
        """Return a single Service by service_id, or None."""
        query = select(Service).where(Service.service_id == service_id)
        return db.session.execute(query).scalars().first()

    @staticmethod
    def get_by_name(name):
        """Return a Service by its name (used to prevent duplicates on create)."""
        query = select(Service).where(Service.service == name)
        return db.session.execute(query).scalars().first()

    @staticmethod
    def create(service):
        """Persist a new Service and return it."""
        db.session.add(service)
        db.session.commit()
        db.session.refresh(service)
        return service
