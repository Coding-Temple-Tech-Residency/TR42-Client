from app.extensions import ma
from app.models.clientapp_model import Vendor

class VendorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Vendor
        fields = ("vendor_id", "name")

vendor_schema = VendorSchema()
vendors_schema = VendorSchema(many=True)
