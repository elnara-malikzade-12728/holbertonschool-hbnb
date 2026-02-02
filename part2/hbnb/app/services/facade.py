from app.persistence.repository import InMemoryRepository
from app.models.user import User

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

    # Placeholder method for fetching a place by ID
    def get_place(self, place_id):
        # Logic will be implemented in later tasks
        pass