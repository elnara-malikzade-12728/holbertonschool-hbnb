from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import review
from app.models.review import Review
from app.services import facade
from sqlalchemy.orm import relationship

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_model = api.model('Review', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True, description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})

@api.route('/')
class ReviewList(Resource):
    @api.expect(review_model)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def post(self):
        """Register a new review"""
        current_user_id = get_jwt_identity()
        review_data = api.payload
        place = facade.get_place(review_data['place_id'])
        if not place:
            return {'error': 'Place not found'}, 404
        if str(place.owner.id) != str(current_user_id):
            return {'message': 'You cannot review your own place'}, 400
        all_reviews = facade.get_all_reviews()
        for r in all_reviews:
            if str(r.place.id) == str(review_data['place_id']) and str(r.user_id) == str(current_user_id):
                return {'error': 'You have already reviewed this place'}, 400
        review_data['user_id'] = current_user_id
        try:
            new_review = facade.create_review(review_data)
            if not new_review:
                return {'error': 'Invalid User or Place ID'}, 400
            return {
                'id': new_review.id,
                'text': new_review.text,
                'rating': new_review.rating,
                'user_id': new_review.user.id,
                'place_id': new_review.place.id
            }, 201
        except ValueError as e:
            # Catches invalid ratings (e.g., > 5) or empty text
            return {'error': str(e)}, 400

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        reviews = facade.get_all_reviews()
        reviews_list = [
            {
                'id': review.id,
                'text': review.text,
                'rating': review.rating
            }
            for review in reviews
        ]
        return reviews_list, 200


@api.route('/<review_id>')
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    def get(self, review_id):
        """Get review details by ID"""
        review = facade.get_review(review_id)
        if not review:
            return {'message': 'Review not found'}, 404
        return {
            'id': review.id,
            'text': review.text,
            'rating': review.rating,
            'user_id': review.user.id,
            'place_id': review.place.id
        }, 200

    @api.expect(review_model)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    @jwt_required()
    def put(self, review_id):
        """Update a review's information"""
        current_user_id = get_jwt_identity()
        review = facade.get_review(review_id)
        if not review:
            return {'message': 'Review not found'}, 404
        if str(review.user.id) != str(current_user_id):
            return {'message': 'Unauthorized action'}, 400
        review_data = api.payload
        try:
            updated_review = facade.update_review(review_id, review_data)
            if not updated_review:
                return {'error': 'Review not found'}, 404
            return { 'message': 'Review updated successfully' }, 200
        except ValueError as e:
            return {'error': str(e)}, 400

    @api.response(200, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    @jwt_required()
    def delete(self, review_id):
        """Delete a review"""
        current_user_id = get_jwt_identity()
        review = facade.get_review(review_id)
        if str(review.user.id) != str(current_user_id):
            return {'message': 'Unauthorized action'}, 400
        if not review:
            return {'message': 'Review not found'}, 404
        facade.delete_review(review_id)
        return {'message': 'Review deleted successfully'}, 200