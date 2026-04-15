from app.extensions import ma
from app.models.msa import Msa
from marshmallow import fields


class MsaSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Msa
        load_instance = True
        include_fk = True
        # Exclude the vendor relationship object - we only need the FK vendor_id on the response
        exclude = ('vendor',)

    # Serialize date fields as ISO strings so the frontend reads them as "2025-08-01" not a Python Date
    effective_date = fields.Date(format='iso')
    expiration_date = fields.Date(format='iso')


msa_schema = MsaSchema()
msas_schema = MsaSchema(many=True)
