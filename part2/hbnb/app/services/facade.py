from scripts.regsetup import description

from app.persistence.repository import InMemoryRepository
from app.models.user import User
from app.models.amenity import Amenity

class HBnBFacade:
    def __init__(self):
        self.user_repo = InMemoryRepository()
        self.place_repo = InMemoryRepository()
        self.review_repo = InMemoryRepository()
        self.amenity_repo = InMemoryRepository()

    def create_user(self, user_data):
        """Create a new user and add it to the repository"""
        user = User(**user_data)
        self.user_repo.add(user)
        return user

    def get_user(self,user_id):
        """Get a user from the repository by id"""
        return self.user_repo.get(user_id)

    def get_user_by_email(self,email):
        """Get a user from the repository by email"""
        return self.user_repo.get(email)

    def get_all_users(self):
        """Get all users from the repository"""
        return self.user_repo.get_all()

    def update_user(self, user_id, user_data):
        user = self.get_user(user_id)
        if not user:
            return None
        # Update the attributes
        user.first_name = user_data.get('first_name', user.first_name)
        user.last_name = user_data.get('last_name', user.last_name)
        user.email = user_data.get('email', user.email)

        # Optional: If your repo requires an explicit update call
        # self.user_repo.update(user_id, user)

        return user

    def create_amenity(self, amenity_data):
        """Create a new amenity and add it to the repository"""
        new_amenity = Amenity(
            name=amenity_data.get('name')
        )
        self.amenity_repo.add(new_amenity)
        return new_amenity

    def get_amenity(self, amenity_id):
        """Get an amenity by id"""
        return self.amenity_repo.get(amenity_id)


    def get_all_amenities(self):
        """Get all amenities from the repository"""
        return self.amenity_repo.get_all()

    def update_amenity(self, amenity_id, amenity_data):
        """Update an amenity by id"""
        amenity = self.get_amenity(amenity_id)
        if not amenity:
            return None
        amenity.name = amenity_data.get('name', amenity.name)
        return amenity




    # Placeholder method for fetching a place by ID
    def get_place(self, place_id):
        # Logic will be implemented in later tasks
        pass