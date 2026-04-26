from app.models.permission import Permission
from app.extensions import db


class PermissionRepository:
    @staticmethod
    def get_permissions_for_roles(role_ids):
        """Return all permissions for a list of role IDs."""
        return Permission.query.filter(Permission.role_id.in_(role_ids)).all()

    @staticmethod
    def aggregate_permissions(role_ids):
        """Compute union of permissions across all given roles."""
        perms = PermissionRepository.get_permissions_for_roles(role_ids)
        result = {}
        for p in perms:
            if p.resource not in result:
                result[p.resource] = {"read": False, "write": False, "delete": False}
            if p.can_read:
                result[p.resource]["read"] = True
            if p.can_write:
                result[p.resource]["write"] = True
            if p.can_delete:
                result[p.resource]["delete"] = True
        return result
