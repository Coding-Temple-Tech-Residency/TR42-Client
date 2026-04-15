from app import ma
from app.models import Vendor, VendorMSA, VendorInsurance, VendorLicense



class VendorMSASchema(ma.SQLAlchemySchema):
    class Meta:
        model = VendorMSA

    msa_id = ma.auto_field()
    msa_number = ma.Str()
    status = ma.Str()
    effective_date = ma.Date()
    expiry_date = ma.Date()


class VendorInsuranceSchema(ma.SQLAlchemySchema):
    class Meta:
        model = VendorInsurance

    insurance_id = ma.auto_field()
    insurer_name = ma.Str()
    policy_number = ma.Str()
    coverage_start = ma.Date()
    coverage_end = ma.Date()


class VendorLicenseSchema(ma.SQLAlchemySchema):
    class Meta:
        model = VendorLicense

    license_id = ma.auto_field()
    license_type = ma.Str()
    license_number = ma.Str()
    valid_from = ma.Date()
    valid_to = ma.Date()


class VendorListSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Vendor

    vendor_id = ma.auto_field()
    vendor_name = ma.Str()
    vendor_code = ma.Str()

    primary_contact_name = ma.Str()
    contact_email = ma.Str()
    contact_phone = ma.Str()

    status = ma.Str()
    services = ma.List(ma.Dict())
    msas = ma.Nested(VendorMSASchema, many=True)


class VendorDetailSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Vendor

    vendor_id = ma.auto_field()
    vendor_name = ma.Str()
    vendor_code = ma.Str()

    primary_contact_name = ma.Str()
    contact_email = ma.Str()
    contact_phone = ma.Str()

    status = ma.Str()
    services = ma.List(ma.Dict())

    msas = ma.Nested(VendorMSASchema, many=True)
    insurance_policies = ma.Nested(VendorInsuranceSchema, many=True)
    licenses = ma.Nested(VendorLicenseSchema, many=True)


vendor_list_schema = VendorListSchema(many=True)
vendor_detail_schema = VendorDetailSchema()