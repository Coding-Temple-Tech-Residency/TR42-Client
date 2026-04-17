from flask import Blueprint, request, jsonify
from app.blueprints.services.well_service import WellService
from app.blueprints.schema.well_schema import well_schema, wells_schema
from app.utils.util import token_required

well_bp = Blueprint("well_bp", __name__)


@well_bp.route("/", methods=["GET"])
@token_required
def get_wells(current_user_id):
    wells = WellService.get_all_wells()
    return wells_schema.jsonify(wells), 200


@well_bp.route("/<well_id>", methods=["GET"])
@token_required
def get_well(current_user_id, well_id):
    try:
        well = WellService.get_well(well_id)
        return jsonify(well_schema.dump(well)), 200
    except ValueError:
        return jsonify({"message": "Well not found"}), 404


@well_bp.route("/", methods=["POST"])
@token_required
def create_well(current_user_id):
    data = request.get_json()
    try:
        validated_data = well_schema.load(data)
    except Exception as err:
        return (
            jsonify(
                {
                    "message": "Validation error",
                    "errors": err.messages if hasattr(err, "messages") else str(err),
                }
            ),
            400,
        )
    well = WellService.create_well(validated_data, current_user_id)
    return jsonify(well_schema.dump(well)), 201


@well_bp.route("/<well_id>", methods=["PUT"])
@token_required
def update_well(current_user_id, well_id):
    data = request.get_json()
    try:
        validated_data = well_schema.load(data, partial=True)
    except Exception as err:
        return (
            jsonify(
                {
                    "message": "Validation error",
                    "errors": err.messages if hasattr(err, "messages") else str(err),
                }
            ),
            400,
        )
    try:
        well = WellService.get_well(well_id)
        for key in data:
            setattr(well, key, getattr(validated_data, key))
        well = WellService.update_well(well, current_user_id)
        return jsonify(well_schema.dump(well)), 200
    except ValueError:
        return jsonify({"message": "Well not found"}), 404


@well_bp.route("/<well_id>", methods=["DELETE"])
@token_required
def delete_well(current_user_id, well_id):
    try:
        WellService.delete_well(well_id)
        return jsonify({"message": "Well deleted"}), 200
    except ValueError:
        return jsonify({"message": "Well not found"}), 404
