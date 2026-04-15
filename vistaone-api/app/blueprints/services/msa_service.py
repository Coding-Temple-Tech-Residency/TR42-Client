import os
import uuid
from werkzeug.utils import secure_filename
from app.models.msa import Msa
from app.blueprints.repository.msa_repository import MsaRepository
from app.blueprints.schema.msa_schema import msa_schema, msas_schema


# Local directory where uploaded MSA PDFs are saved
# The path is relative to the API root folder (vistaone-api/)
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'uploads', 'msa')


def ensure_upload_dir():
    """Create the upload directory if it doesn't exist yet."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)


class MsaService:

    @staticmethod
    def get_all(vendor_id=None, status=None):
        """Return MSA list, optionally filtered by vendor or status."""
        records = MsaRepository.get_all(vendor_id=vendor_id, status=status)

        results = []
        for m in records:
            data = msa_schema.dump(m)
            # Enrich each MSA with vendor name and uploader name for display in the contracts table
            data['vendor_name'] = MsaRepository.get_vendor_name(m.vendor_id)
            data['uploaded_by_name'] = MsaRepository.get_uploader_name(m.uploaded_by)
            results.append(data)

        return results, 200

    @staticmethod
    def get_by_id(msa_id):
        """Return a single MSA or 404."""
        record = MsaRepository.get_by_id(msa_id)
        if not record:
            return {'message': 'MSA not found'}, 404

        data = msa_schema.dump(record)
        data['vendor_name'] = MsaRepository.get_vendor_name(record.vendor_id)
        data['uploaded_by_name'] = MsaRepository.get_uploader_name(record.uploaded_by)
        return data, 200

    @staticmethod
    def upload_msa(form_data, file, user_id):
        """
        Handle MSA document upload.
        form_data contains: vendor_id, version, effective_date (optional), expiration_date (optional)
        file is the uploaded PDF from request.files
        """
        vendor_id = form_data.get('vendor_id', '').strip()
        if not vendor_id:
            return {'message': 'vendor_id is required'}, 400

        version = form_data.get('version', '').strip()
        if not version:
            return {'message': 'version is required'}, 400

        # Validate the uploaded file
        if not file or file.filename == '':
            return {'message': 'A PDF file is required'}, 400

        if not file.filename.lower().endswith('.pdf'):
            return {'message': 'Only PDF files are allowed'}, 400

        # Save the file to disk with a unique prefix to avoid name collisions
        ensure_upload_dir()
        safe_name = secure_filename(file.filename)
        unique_name = f"{str(uuid.uuid4())}_{safe_name}"
        save_path = os.path.join(UPLOAD_DIR, unique_name)
        file.save(save_path)

        msa = Msa(
            vendor_id=vendor_id,
            version=version,
            effective_date=form_data.get('effective_date') or None,
            expiration_date=form_data.get('expiration_date') or None,
            # New uploads are set to active - the operator can change status after review
            status='active',
            uploaded_by=str(user_id),
            file_name=unique_name,
            created_by=str(user_id),
        )

        saved = MsaRepository.create(msa)
        data = msa_schema.dump(saved)
        data['vendor_name'] = MsaRepository.get_vendor_name(saved.vendor_id)
        data['uploaded_by_name'] = MsaRepository.get_uploader_name(saved.uploaded_by)
        return data, 201

    @staticmethod
    def update_msa(msa_id, body, user_id):
        """Update MSA metadata fields (status, version, dates). Cannot re-upload file here."""
        record = MsaRepository.get_by_id(msa_id)
        if not record:
            return {'message': 'MSA not found'}, 404

        # Allowed fields to update via PATCH
        for field in ['version', 'effective_date', 'expiration_date', 'status']:
            if field in body:
                setattr(record, field, body[field])

        # Validate status is one of the known values
        valid_statuses = {'active', 'expired', 'incomplete', 'pending'}
        if record.status not in valid_statuses:
            return {'message': f"Invalid status. Choose from: {', '.join(valid_statuses)}"}, 400

        record.updated_by = str(user_id)

        saved = MsaRepository.update(record)
        data = msa_schema.dump(saved)
        data['vendor_name'] = MsaRepository.get_vendor_name(saved.vendor_id)
        data['uploaded_by_name'] = MsaRepository.get_uploader_name(saved.uploaded_by)
        return data, 200
