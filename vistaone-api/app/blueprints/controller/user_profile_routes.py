
from flask import request, jsonify, Blueprint
from app.utils.util import token_required
from app.blueprints.services.user_profile_service import UserProfileService
from app.blueprints.schema.user_profile_schema import user_profile_schema
from app.blueprints.schema.change_password_schema import change_password_schema
from marshmallow import ValidationError
import logging


logger = logging.getLogger(__name__)


profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/", methods=["GET"])
@token_required
def get_profile(current_user_id):

    try:
        if not current_user_id:
            raise Exception("current_user_id not provided!")
        
        data = UserProfileService.get_profile(current_user_id)
        return user_profile_schema.jsonify(data), 200
    
    except ValueError:
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@profile_bp.route("/", methods=["PUT"])
@token_required
def update_profile(current_user_id):
    json_data = request.get_json()

    if not json_data:
        return jsonify({"error": "No input data provided"}), 400
    if not current_user_id:
        raise Exception("current_user_id not provided!")


    try:
        validated_data = user_profile_schema.load(json_data, partial=True)

        user = UserProfileService.update_profile(current_user_id, validated_data)
        return jsonify({
        "message": "Updated successfully",
        "data": user_profile_schema.dump(user)
        }), 200
    
    except ValidationError as err:
        return jsonify(err.messages), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@profile_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password(current_user_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No input data provided"}), 400
        if not current_user_id:
            raise Exception("current_user_id not provided!")
 
        validate_data=  change_password_schema.load(data)

        UserProfileService.change_password(current_user_id,validate_data)

        return jsonify({"message": "Password changed successfully"}), 200
    
    except ValidationError as err:
        return jsonify(err.messages), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400
    

@profile_bp.route("/", methods=["DELETE"])
@token_required
def delete_profile(current_user_id):

    if not current_user_id:
        raise Exception("current_user_id not provided!")
    
    try:
        result = UserProfileService.delete_user(current_user_id)
     
        return jsonify({"message": "Deleted successfully"}), 200
    
    except ValueError:
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 400