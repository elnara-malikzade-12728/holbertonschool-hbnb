from app.models import Basemodel

class Place(Basemodel):
    def __init__(self, title, description, price, latitude, longitude, owner):
        super().__init__()
        self.title = title
        self.description = description
        self.price = price
        self.latitude = latitude
        self.longitude = longitude
        self.owner = owner   # Reference to a User instance
        self.reviews = []    # List to store related reviews
        self.amenities = []  # List to store related amenities

    def add_review(self, review):
        """Adds a review to the place"""
        self.reviews.append(review)

    def add_amenity(self, amenity):
        """Adds an amenity to the place"""
        self.amenities.append(amenity)