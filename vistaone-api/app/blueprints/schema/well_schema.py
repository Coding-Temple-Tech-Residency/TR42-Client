from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from app.models.wells import Well

class WellSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Well
        load_instance = True
        include_fk = True
