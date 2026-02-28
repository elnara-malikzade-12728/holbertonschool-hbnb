from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token, get_jwt
from app.services import facade

api = Namespace('auth', description='Authentication operations')

# Model for input validation
login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})


@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        """Authenticate user and return a JWT token"""
        credentials = api.payload  # Get the email and password from the request payload

        # Step 1: Retrieve the user based on the provided email
        user = facade.get_user_by_email(credentials['email'])

        # Step 2: Check if the user exists and the password is correct
        if not user or not user.verify_password(credentials['password']):
            return {'error': 'Invalid credentials'}, 401

        # Step 3: Create a JWT token with the user's id and is_admin flag
        additional_claims = {
            "id": str(user.id),
            "is_admin": bool(user.is_admin),
        }
        access_token = create_access_token(
            identity=str(user.id),  # only user ID goes here
            additional_claims=additional_claims # extra info here
        )

        # Step 4: Return the JWT token to the client
        return {'access_token': access_token}, 200

def jwt_user_id() -> str:
    claims = get_jwt()
    return claims.get("id")

def jwt_is_admin() -> bool:
    claims = get_jwt()
    return bool(claims.get("is_admin", False))

def require_admin():
    if not jwt_is_admin():
        return {"error": "Admin privileges required"}, 403
    return None






from flask import request, current_app

@api.route('/bootstrap-admin')
class BootstrapAdmin(Resource):
    """
    DEV ONLY: Create (or promote) an admin user so you can login and get an admin token.
    REMOVE BEFORE SUBMISSION/PRODUCTION.
    """
    def post(self):
        # Optional safety: only allow in debug
        if not current_app.config.get("DEBUG", False):
            return {"error": "Not available"}, 404

        data = request.get_json() or {}
        email = (data.get("email") or "").strip().lower()
        password = data.get("password")

        if not email or not password:
            return {"error": "email and password required"}, 400

        user = facade.get_user_by_email(email)

        if user:
            # Promote to admin (and optionally reset password)
            facade.update_user(user.id, {"is_admin": True, "password": password})
            return {"message": "Existing user promoted to admin. Login now."}, 200

        # Create admin user
        new_user = facade.create_user({
            "email": email,
            "password": password,
            "first_name": data.get("first_name", "Admin"),
            "last_name": data.get("last_name", "User"),
            "is_admin": True
        })
        return {"message": "Admin user created. Login now.", "id": new_user.id}, 201
