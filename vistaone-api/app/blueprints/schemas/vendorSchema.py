# schemas/vendor_schema.py

from app.extensions import ma
from app.models.vendor import Vendor


class VendorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Vendor
        load_instance = True
        include_fk = True

vendor_schema = VendorSchema()
vendors_schema = VendorSchema(many=True)
