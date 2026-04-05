from flask import request, jsonify
from . import workorder_bp
from app.models import WorkOrder,db
from app.blueprints.schema import workorder_schema, workorders_schema
from app.blueprints.services.workorder_service import create_workorder
import uuid
from sqlalchemy import select
from marshmallow import ValidationError

@workorder_bp.route("/", methods=["POST"])

def create():
    json_data = request.get_json()
    try:
        workorder = workorder_schema.load(json_data)
    except Exception as err:
        return jsonify({"error": str(err)}), 400

    created = create_workorder(workorder)
    return workorder_schema.jsonify(created), 201