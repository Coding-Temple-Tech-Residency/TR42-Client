from flask import request, jsonify, send_from_directory
from . import msa_bp
from app.utils.util import token_required
from app.blueprints.services.msa_service import MsaService, UPLOAD_DIR


# GET /msa/ - list all MSA records
# Optional query params: vendor_id=<id>, status=active|expired|incomplete|pending
@msa_bp.get('/')
@token_required
def list_msas(user_id):
    vendor_id = request.args.get('vendor_id')
    status = request.args.get('status')

    result, code = MsaService.get_all(vendor_id=vendor_id, status=status)
    return jsonify(result), code


# GET /msa/<msa_id> - return a single MSA record
@msa_bp.get('/<string:msa_id>')
@token_required
def get_msa(user_id, msa_id):
    result, code = MsaService.get_by_id(msa_id)
    return jsonify(result), code


# POST /msa/ - upload a new MSA document
# Expects multipart/form-data with fields: vendor_id, version, (optional) effective_date, expiration_date
# File field: 'file' (PDF only, max 25MB enforced client-side)
@msa_bp.post('/')
@token_required
def upload_msa(user_id):
    # request.form contains the text fields from multipart/form-data
    form_data = request.form
    file = request.files.get('file')

    result, code = MsaService.upload_msa(form_data, file, user_id)
    return jsonify(result), code


# PATCH /msa/<msa_id> - update MSA metadata (status, version, dates)
# Cannot re-upload the file via this endpoint - submit a new POST instead
@msa_bp.patch('/<string:msa_id>')
@token_required
def update_msa(user_id, msa_id):
    body = request.get_json()
    if not body:
        return jsonify({'message': 'Request body is required'}), 400

    result, code = MsaService.update_msa(msa_id, body, user_id)
    return jsonify(result), code


# GET /msa/<msa_id>/download - serve the uploaded PDF file
@msa_bp.get('/<string:msa_id>/download')
@token_required
def download_msa(user_id, msa_id):
    from app.blueprints.repository.msa_repository import MsaRepository
    record = MsaRepository.get_by_id(msa_id)

    if not record or not record.file_name:
        return jsonify({'message': 'File not found'}), 404

    return send_from_directory(UPLOAD_DIR, record.file_name, as_attachment=True)
