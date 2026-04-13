from uuid import UUID

from flask import Blueprint, request, jsonify

from app.blueprints.schemas import vendor_schema, vendors_schema
from app.blueprints.services.vendor_service import VendorService

vendor_bp = Blueprint("vendor_bp", __name__, url_prefix="/vendors")


@vendor_bp.get("")
def list_vendors():
    args = request.args
    filters = {
        "status": args.get("status"),
        "service_type": args.get("service_type"),
        "compliance_status": args.get("compliance_status"),
    }
    page = int(args.get("page", 1))
    page_size = int(args.get("page_size", 20))
    sort = args.get("sort", "created_at")
    direction = args.get("direction", "desc")

    items, total = VendorService.list_vendors(filters, page, page_size, sort, direction)
    return jsonify({
        "items": vendors_schema.dump(items),
        "total": total,
        "page": page,
        "page_size": page_size,
    }), 200


@vendor_bp.get("/<uuid:vendor_id>")
def get_vendor(vendor_id: UUID):
    try:
        vendor = VendorService.get_vendor_detail(vendor_id)
        return vendor_schema.dump(vendor), 200
    except LookupError as e:
        return jsonify({"error": str(e)}), 404


@vendor_bp.post("")
def create_vendor():
    data = request.get_json() or {}
    try:
        vendor = VendorService.create_vendor(data, changed_by="system")
        return vendor_schema.dump(vendor), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 409
    except KeyError as e:
        return jsonify({"error": f"Missing required field: {e}"}), 400


@vendor_bp.post("/<uuid:vendor_id>/status")
def update_vendor_status(vendor_id: UUID):
    data = request.get_json() or {}
    new_status = data.get("status")
    reason = data.get("reason")

    try:
        vendor = VendorService.update_status(vendor_id, new_status, reason, changed_by="system")
        return vendor_schema.dump(vendor), 200
    except LookupError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
