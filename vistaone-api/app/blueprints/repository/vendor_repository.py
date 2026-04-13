from app import db
from models import Vendor, VendorMSA
from sqlalchemy.orm import joinedload
from sqlalchemy import or_



class VendorRepository:

    @staticmethod
    def list_vendors(
        search=None,
        status=None,
        service_id=None,
        msa_status=None,
        page=1,
        per_page=25
        sort_field="vendor_name",
        sort_dir="asc",):
        query = Vendor.query.options(
            joinedload(Vendor.msas))
        if search:
            like = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    db.func.lower(Vendor.vendor_name).like(like),
                    db.func.lower(Vendor.vendor_code).like(like),
                    db.func.lower(Vendor.primary_contact_name).like(like),
                )
            )

        if status and status != "all":
            query = query.filter(Vendor.status == status)

        if service_id and service_id != "all":
            query = query.filter(
                Vendor.services.contains([{"service_id": int(service_id)}])
            )

        if msa_status and msa_status != "all":
            query = query.join(VendorMSA).filter(VendorMSA.status == msa_status)

        # sorting
        sort_column = getattr(Vendor, sort_field, Vendor.vendor_name)
        if sort_dir == "desc":
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        query = query.order_by(sort_column)

        # pagination
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination