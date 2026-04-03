# schemas/vendor_schema.py

from app import ma
from models.vendors import Vendor

class VendorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Vendor
        load_instance = True
        include_fk = True

vendor_schema = VendorSchema()
vendors_schema = VendorSchema(many=True)
