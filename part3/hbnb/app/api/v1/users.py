from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import jwt_required, get_jwt_identity


api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_model = api.model('User', {
    'first_name': fields.String(required=True, description='First name of the user'),
    'last_name': fields.String(required=True, description='Last name of the user'),
    'email': fields.String(required=True, description='Email of the user')
})

user_update_model = api.model('UserUpdate', {
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name')
})

@api.route('/protected')
class ProtectedResource(Resource):
    @jwt_required()
    def get(self):
         """A protected endpoint that requires a valid JWT token"""
         print("jwt------")
         print(get_jwt_identity())
         current_user = get_jwt_identity() # Retrieve the user's identity from the token
         #if you need to see if the user is an admin or not, you can access additional claims using get_jwt() :
         # additional claims = get_jwt()
         #additional claims["is_admin"] -> True or False
         return {'message': f'Hello, user {current_user}'}, 200

@api.route('/')
class UserList(Resource):
    @api.response(200, 'Users successfully retrieved')
    def get(self):
        """Get all users"""
        users = facade.get_all_users()
        users_list = [
            {'id': user.id, 'first_name': user.first_name, 'last_name': user.last_name}
            for user in users
            ]
        return users_list, 200


    @api.expect(user_model, validate=True)
    @api.response(201, 'User successfully created')
    @api.response(400, 'Email already registered')
    def post(self):
        """Register a new user"""
        user_data = api.payload
        try:
            new_user = facade.create_user(user_data)
        except ValueError as e:
            return {'message': str(e)}, 400
        if not new_user:
            return {'message': 'User already exists'}, 400
        return {
            'id': new_user.id
        }, 201

@api.route('/<user_id>')
class UserResource(Resource):
    @api.response(200, 'User successfully retrieved')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get a user by id"""
        user = facade.get_user(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        return {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name
        }, 200

    @api.expect(user_update_model, validate=True)
    @api.response(200, 'User successfully updated')
    @api.response(400, 'Invalid input data')
    @api.response(404, 'User not found')
    @jwt_required()
    def put(self, user_id):
        """Update a user's information"""
        current_user_id = get_jwt_identity()
        user_data = api.payload

        if user_id != current_user_id:
            return {'error': 'Unauthorized action'}, 403
        if 'email' in user_data or 'password' in user_data:
            return {'error': 'You cannot modify email or password'}, 400
        try:
            updated_user = facade.update_user(user_id, user_data)
            if not updated_user:
                return {'error': 'User not found'}, 404
            return {
                'id': updated_user.id,
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name,
                'email': updated_user.email
            }, 200
        except ValueError as e:
            return {'error': str(e)}, 400

