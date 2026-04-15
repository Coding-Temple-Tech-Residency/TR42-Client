from sqlalchemy import select
from app.models import db
from app.models.msa import Msa
from app.models.vendor import Vendor
from app.models.user import User


class MsaRepository:

    @staticmethod
    def get_all(vendor_id=None, status=None):
        """Return all MSA records with optional vendor_id or status filter."""
        query = select(Msa)

        if vendor_id:
            query = query.where(Msa.vendor_id == vendor_id)

        if status:
            query = query.where(Msa.status == status)

        return db.session.execute(query).scalars().all()

    @staticmethod
    def get_by_id(msa_id):
        """Return a single MSA by msa_id, or None."""
        query = select(Msa).where(Msa.msa_id == msa_id)
        return db.session.execute(query).scalars().first()

    @staticmethod
    def create(msa):
        """Persist a new Msa instance and return it."""
        db.session.add(msa)
        db.session.commit()
        db.session.refresh(msa)
        return msa

    @staticmethod
    def update(msa):
        """Commit changes to an existing Msa and return it."""
        db.session.commit()
        db.session.refresh(msa)
        return msa

    @staticmethod
    def get_vendor_name(vendor_id):
        """Helper to look up a vendor's company_name by vendor_id for enriched MSA responses."""
        query = select(Vendor.company_name).where(Vendor.vendor_id == vendor_id)
        result = db.session.execute(query).scalars().first()
        return result

    @staticmethod
    def get_uploader_name(user_id):
        """Look up the uploader's full name from the users table by user_id.
        uploaded_by stores the user's ID as a string - we convert to int for the query."""
        if not user_id:
            return None
        try:
            query = select(User).where(User.id == int(user_id))
            user = db.session.execute(query).scalars().first()
            if user:
                return f"{user.first_name} {user.last_name}"
            return None
        except (ValueError, TypeError):
            # user_id could not be cast to int - return None instead of crashing
            return None
