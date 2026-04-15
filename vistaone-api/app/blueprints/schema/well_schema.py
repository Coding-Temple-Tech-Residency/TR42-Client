from app.extensions import ma
from app.models.wells import Well


class WellSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Well
        load_instance = True
        include_fk = True


well_schema = WellSchema()
wells_schema = WellSchema(many=True)
