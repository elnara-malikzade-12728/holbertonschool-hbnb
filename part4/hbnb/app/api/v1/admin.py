from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from flask import request
from app.services import facade

api = Namespace('admin', description='Admin operations')

# =====================================================
# DEV ONLY — Bootstrap endpoint to become admin
# REMOVE BEFORE PRODUCTION
# =====================================================
@api.route('/make-me-admin')
class MakeMeAdmin(Resource):
    """
    DEV ONLY!
    Promote the currently logged-in user to admin.
    You MUST login again to get an admin token.
    """
    @jwt_required()
    def post(self):
        user_id = get_jwt_identity()
        facade.update_user(user_id, {"is_admin": True})
        return {
            "message": "You are now admin. Login again to get an admin token."
        }, 200


# =====================================================
# ADMIN USER UPDATE — Task-required endpoint
# PUT /api/v1/admin/users/<user_id>
# =====================================================
@api.route('/users/<user_id>')
class AdminUserResource(Resource):
    """
    Admin-only endpoint to update ANY user.
    Can update email, password, etc.
    """
    @jwt_required()
    def put(self, user_id):
        claims = get_jwt()

        # RBAC check
        if not claims.get("is_admin", False):
            return {'error': 'Admin privileges required'}, 403

        data = request.get_json() or {}

        # Email uniqueness check
        if "email" in data:
            email = (data.get("email") or "").strip().lower()
            if not email:
                return {'error': 'Email cannot be empty'}, 400

            existing_user = facade.get_user_by_email(email)
            if existing_user and str(existing_user.id) != str(user_id):
                return {'error': 'Email is already in use'}, 400

            data["email"] = email

        # Optional: prevent admin from changing is_admin accidentally
        if "is_admin" in data:
            data.pop("is_admin")

        updated_user = facade.update_user(user_id, data)
        if not updated_user:
            return {"error": "User not found"}, 404

        return updated_user.to_dict(), 200
